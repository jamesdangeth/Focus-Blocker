// Chrome Extension Background Service Worker
import { classifyIntent } from '../services/geminiService';
import { logDebug } from './utils';

let isProcessingQueue = false;

// Promise chain mutex to prevent storage write duplication and eliminate in-memory data loss
let storageLock = Promise.resolve();

const queueEvent = (event: any) => {
  storageLock = storageLock.then(async () => {
    try {
      const res = await chrome.storage.local.get(['eventQueue']);
      const q = res.eventQueue || [];
      // Handle putting back a batch of failed items, or a single item
      if (Array.isArray(event)) {
        q.push(...event);
      } else {
        q.push(event);
      }
      await chrome.storage.local.set({ eventQueue: q });
      
      if (q.length >= 10) {
        processQueue();
      } else {
        chrome.alarms.create('flushQueue', { delayInMinutes: 1 });
      }
    } catch (err) {
      logDebug('Queue event failed', err);
    }
  });
};

const processQueue = () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  
  storageLock = storageLock.then(async () => {
    try {
      const res = await chrome.storage.local.get(['eventQueue']);
      const q = res.eventQueue || [];
      if (q.length === 0) {
        isProcessingQueue = false;
        return;
      }
      
      const batch = [...q];
      // Clear locally within the lock
      await chrome.storage.local.set({ eventQueue: [] });
      
      // Execute the fake api request asynchronously without holding the lock
      setTimeout(async () => {
        try {
          const startTime = performance.now();
          logDebug(`Flushing ${batch.length} tracking events to database...`);
          await new Promise(r => setTimeout(r, 50));
          
          const latency = performance.now() - startTime;
          logDebug(`✅ Queued events saved successfully (Latency: ${latency.toFixed(2)}ms)`);
        } catch (error) {
          logDebug('Error flushing queue, holding events in memory', error);
          queueEvent(batch);
        } finally {
          isProcessingQueue = false;
        }
      }, 0);
    } catch (err) {
      logDebug('Queue extraction failed', err);
      isProcessingQueue = false;
    }
  });
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Smart Focus Pro Installed');
});

// Alarm for session timer & queue flush
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusSession') {
    chrome.storage.local.get(['smart-focus-storage'], (data) => {
      if (data['smart-focus-storage']) {
        try {
          const store = JSON.parse(data['smart-focus-storage']);
          store.state.isActive = false;
          store.state.sessionEndTime = null;
          chrome.storage.local.set({ 'smart-focus-storage': JSON.stringify(store) });
        } catch (e) {
          logDebug('Error updating session state from alarm', e);
        }
      }
    });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon128.png',
      title: 'Session Complete',
      message: 'Great job! Take a well-deserved break.'
    });
  } else if (alarm.name === 'flushQueue') {
    processQueue();
  }
});

// Listener for SPA navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { type: 'SPA_NAVIGATION', url: changeInfo.url }).catch(() => {});
  }
});

// Listener for content script messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_URL') {
    const url = new URL(request.url).hostname;
    chrome.storage.local.get(['smart-focus-storage', 'distractionStats'], async (data) => {
      const storeData = data['smart-focus-storage'] ? JSON.parse(data['smart-focus-storage']).state : {};
      const blockedSites = storeData.blockedSites || [];
      const isActive = storeData.isActive || false;

      const isBlocked = blockedSites ? blockedSites.some((site: string) => url.includes(site)) : false;

      if (isBlocked && isActive) {
        // Daily Distraction Tracking Logic
        const todayStr = new Date().toISOString().split('T')[0];
        let stats = data.distractionStats || { date: todayStr, totalToday: 0, domains: {} };
        
        // Reset if new day
        if (stats.date !== todayStr) {
          stats = { date: todayStr, totalToday: 0, domains: {} };
        }
        
        const now = Date.now();
        stats.totalToday += 1;
        if (!stats.domains[url]) stats.domains[url] = [];
        stats.domains[url].push(now);
        
        // Clean old logs (older than 24h)
        stats.domains[url] = stats.domains[url].filter((t: number) => now - t < 24 * 60 * 60 * 1000);
        
        chrome.storage.local.set({ distractionStats: stats });

        // Trigger Conditions Check (Pain Moment)
        const hourAgo = now - 3600000;
        const recentVisitsCount = stats.domains[url].filter((t: number) => t > hourAgo).length;
        const isPainMoment = stats.totalToday > 10 || recentVisitsCount >= 5;

        if (isPainMoment) {
          logDebug(`Pain Moment Triggered! Total: ${stats.totalToday}, Site: ${url} (${recentVisitsCount} in last hour)`);
          sendResponse({
            blocked: true,
            isPainMoment: true,
            painData: {
              url,
              count: stats.domains[url].length,
              totalToday: stats.totalToday
            }
          });
        } else {
          // Immediately block the page, then classify async
          sendResponse({ blocked: true, isPainMoment: false, pendingIntent: true });
          
          (async () => {
            const apiStart = performance.now();
            try {
              // Failsafe: Max wait time 3 seconds
              const timeoutPromise = new Promise<{intent: string}>((_, reject) => 
                setTimeout(() => reject(new Error('AI Classification Timed Out')), 3000)
              );
              
              const classification = await Promise.race([
                classifyIntent(url, new Date().toISOString(), []),
                timeoutPromise
              ]);
              
              const apiLatency = performance.now() - apiStart;
              logDebug(`AI Intent Classification took ${apiLatency.toFixed(2)}ms`);
              
              if (sender.tab?.id) {
                chrome.tabs.sendMessage(sender.tab.id, { 
                  type: 'INTENT_CLASSIFIED', 
                  intent: classification.intent 
                }).catch(() => {});
              }
            } catch (err) {
              logDebug('AI Classification Failed (Failsafe triggered)', err);
              if (sender.tab?.id) {
                // Fail-closed security design: DO NOT unlock automatically
                chrome.tabs.sendMessage(sender.tab.id, { 
                  type: 'INTENT_CLASSIFIED', 
                  intent: 'unknown',
                  failsafe: true
                }).catch(() => {});
              }
            }
          })();
        }
      } else {
        sendResponse({ blocked: false });
      }
    });
    return true; // Keep channel open
  }

  if (request.type === 'LOG_PAIN_REACTION') {
    const { reaction, url, count, totalToday } = request.payload;
    logDebug(`User reacted to pain moment: ${reaction}`);
    // Queue PainMomentEvent
    chrome.storage.local.get(['userId'], (data) => {
      const eventId = "pain-" + Date.now();
      const painEvent = {
        id: eventId,
        user_id: data.userId || 'anonymous_user',
        trigger_count: count,
        domain: url,
        timestamp: new Date().toISOString(),
        reaction,
        type: 'pain_moment'
      };
      queueEvent(painEvent);
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'LOG_DISTRACTION_EVENT') {
    const { url, intent, action } = request.payload;
    chrome.storage.local.get(['userId'], (data) => {
      const eventId = "dist-" + Date.now();
      const distractionEvent = {
        id: eventId,
        user_id: data.userId || 'anonymous_user',
        url,
        timestamp: new Date().toISOString(),
        intent,
        action,
        type: 'distraction_event'
      };

      queueEvent(distractionEvent);
      sendResponse({ success: true });
    });
    return true;
  }
});
