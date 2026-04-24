// Chrome Extension Content Script
import { debounce, logDebug } from './utils';

logDebug('Protection Active');

let isIntercepting = false;

const preventScroll = (e: Event) => {
  e.preventDefault();
};

const lockScroll = () => {
  if (document.body) document.body.style.overflow = 'hidden';
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
};

const unlockScroll = () => {
  if (document.body) document.body.style.overflow = '';
  window.removeEventListener('wheel', preventScroll);
  window.removeEventListener('touchmove', preventScroll);
};

const exitFullscreenIfActive = async () => {
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen();
    } catch (e) {
      logDebug("Could not exit fullscreen", e);
    }
  }
};

const performCheck = async (url: string) => {
  if (isIntercepting || document.visibilityState !== 'visible') return;
  const startTime = performance.now();
  
  try {
    chrome.runtime.sendMessage({ type: 'CHECK_URL', url }, (response) => {
      const latency = performance.now() - startTime;
      logDebug(`URL Check completed in ${Math.round(latency)}ms`);
      
      if (chrome.runtime.lastError) {
        logDebug('Failsafe: Extension context error.', chrome.runtime.lastError);
        return;
      }
      
      if (response && response.blocked && !document.getElementById('smart-focus-overlay') && !document.getElementById('smart-focus-pain-overlay')) {
        isIntercepting = true;
        if (response.isPainMoment) {
          injectPainOverlay(response.painData);
        } else {
          injectOverlay();
        }
      }
    });
  } catch (error) {
    console.error('SmartFocus Failsafe triggered:', error);
  }
};

const handleIntercept = debounce(() => {
  performCheck(window.location.href);
}, 300);

const injectPainOverlay = (data: any) => {
  const container = document.createElement('div');
  container.id = 'smart-focus-pain-overlay';
  
  // Use Shadow DOM to isolate styles and avoid CSP inline style blocking
  const shadow = container.attachShadow({ mode: 'open' });
  
  exitFullscreenIfActive();
  const hoursLost = ((data.totalToday * 5) / 60).toFixed(1);

  shadow.innerHTML = `
    <style>
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 18, 38, 0.95);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: 'Inter', system-ui, sans-serif;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
      }
      .card {
        background: rgba(255,255,255,0.03); 
        padding: 56px; 
        border-radius: 32px; 
        border: 1px solid rgba(255,100,100,0.2); 
        text-align: center; 
        max-width: 540px; 
        box-shadow: 0 24px 60px rgba(0,0,0,0.4);
      }
      .icon-container {
        background: rgba(255,100,100,0.1); 
        color: #ff6b6b; 
        display: inline-flex; 
        padding: 12px; 
        border-radius: 20px; 
        margin-bottom: 24px;
      }
      h1 {
        font-size: 36px; 
        margin-bottom: 12px; 
        font-weight: 800; 
        letter-spacing: -0.02em; 
        line-height: 1.2;
      }
      .highlight { color: #ff6b6b; }
      p {
        color: rgba(255,255,255,0.5); 
        font-size: 20px; 
        margin-bottom: 40px;
      }
      .buttons {
        display: flex; 
        flex-direction: column; 
        gap: 16px; 
        width: 100%;
      }
      .btn-back {
        background: white; 
        color: #0F1226; 
        border: none; 
        padding: 20px; 
        border-radius: 16px; 
        font-weight: 700; 
        font-size: 16px; 
        cursor: pointer; 
        transition: transform 0.2s;
      }
      .btn-upgrade {
        background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%); 
        color: #0F1226; 
        border: none; 
        padding: 16px; 
        border-radius: 16px; 
        font-weight: 700; 
        font-size: 15px; 
        cursor: pointer; 
        box-shadow: 0 8px 20px rgba(253,185,49,0.3);
      }
    </style>
    <div class="card">
      <div class="icon-container">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1>
        You tried to open <span class="highlight">${data.url}</span> ${data.count} times today.
      </h1>
      <p>
        That's roughly <strong>~${hoursLost} hours</strong> lost.
      </p>
      
      <div class="buttons">
        <button id="pain-focus-back" class="btn-back">
          Get back to focus
        </button>
        <button id="pain-focus-upgrade" class="btn-upgrade">
          ✨ Unlock AI Insights & Fix your habits
        </button>
      </div>
    </div>
  `;

  // Provide high z-index and styles for container (to override page defaults on container itself)
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.zIndex = '2147483647';
  
  document.documentElement.appendChild(container);
  lockScroll();

  shadow.getElementById('pain-focus-back')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOG_PAIN_REACTION', payload: { reaction: 'back_to_focus', count: data.count, url: data.url, totalToday: data.totalToday } });
    unlockScroll();
    window.location.href = 'about:newtab';
  });

  shadow.getElementById('pain-focus-upgrade')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOG_PAIN_REACTION', payload: { reaction: 'upgrade_clicked', count: data.count, url: data.url, totalToday: data.totalToday } });
    alert("Opening Dashboard to Upgrade...");
    isIntercepting = false;
    unlockScroll();
    container.remove();
  });
};

const logDistraction = (intent: string, action: string) => {
  chrome.runtime.sendMessage({
    type: 'LOG_DISTRACTION_EVENT',
    payload: {
      url: window.location.hostname,
      intent,
      action
    }
  });
};

let intentOverlayState = 'analyzing';

const injectOverlay = () => {
  const container = document.createElement('div');
  container.id = 'smart-focus-overlay';
  
  container.style.position = 'fixed';
  container.style.inset = '0';
  container.style.zIndex = '2147483647';
  
  exitFullscreenIfActive();

  const shadow = container.attachShadow({ mode: 'open' });

  const styleNode = document.createElement('style');
  styleNode.textContent = `
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 10, 15, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .card {
      background: rgba(255, 255, 255, 0.03); 
      padding: 48px; 
      border-radius: 32px; 
      border: 1px solid rgba(255,255,255,0.08); 
      text-align: center; 
      max-width: 480px; 
      width: 100%;
      box-shadow: 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
      position: relative;
      overflow: hidden;
    }
    .glow {
      position: absolute;
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      width: 200px;
      height: 200px;
      background: rgba(108, 92, 231, 0.4);
      filter: blur(80px);
      pointer-events: none;
    }
    .pulse-icon {
      width: 72px; 
      height: 72px; 
      margin: 0 auto 32px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: rgba(108, 92, 231, 0.1);
      border-radius: 24px;
      border: 1px solid rgba(108, 92, 231, 0.2);
    }
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .spinner { animation: spin 2s linear infinite; }
    h2 { font-size: 28px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.02em; }
    .text-muted { color: rgba(255,255,255,0.6); font-size: 16px; line-height: 1.5; margin-bottom: 32px; }
    .ai-box {
      background: rgba(253, 185, 49, 0.1);
      border: 1px solid rgba(253, 185, 49, 0.2);
      border-radius: 16px;
      padding: 16px;
      color: #FDB931;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 32px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-align: left;
    }
    .action-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn {
      display: flex; 
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      padding: 18px;
      border-radius: 16px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-primary {
      background: white;
      color: #0A0A0F;
      box-shadow: 0 8px 24px rgba(255,255,255,0.15);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(255,255,255,0.25);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.05);
      color: white;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.1);
    }
    .link-subtle {
      display: inline-block;
      margin-top: 24px;
      color: rgba(255,255,255,0.4);
      font-size: 14px;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s;
      background: none;
      border: none;
    }
    .link-subtle:hover {
      color: rgba(255,255,255,0.8);
    }
  `;
  shadow.appendChild(styleNode);
  
  const contentNode = document.createElement('div');
  shadow.appendChild(contentNode);

  const renderStart = performance.now();
  document.documentElement.appendChild(container);
  lockScroll();
  
  if (process.env.NODE_ENV === 'development') {
    logDebug(`Overlay rendered in ${(performance.now() - renderStart).toFixed(2)}ms`);
  }

  const renderAnalyzing = () => {
    contentNode.innerHTML = `
      <div class="card">
        <div class="glow"></div>
        <div class="pulse-icon">
          <svg class="spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        </div>
        <h2>Pause.</h2>
        <p class="text-muted">
          Evaluating <strong>${window.location.hostname}</strong>.
        </p>
      </div>
    `;
  };

  const questionScreen = (intentText?: string) => `
    <div class="card">
      <div class="glow"></div>
      <div class="pulse-icon" style="animation: none; background: rgba(0, 209, 178, 0.1); border-color: rgba(0, 209, 178, 0.2);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D1B2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </div>
      <h2>Focus Shield.</h2>
      <p class="text-muted">
         Is the visit to <strong>${window.location.hostname}</strong> intentional?
      </p>
      
      ${intentText ? `
      <div class="ai-box">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <div>
          <div style="font-size:11px; text-transform:uppercase; letter-spacing:0.05em; opacity:0.8; margin-bottom:2px;">Reason</div>
          "${intentText}"
        </div>
      </div>` : ''}
      
      <div class="action-grid">
        <button id="btn-focus" class="btn btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          Resume Focus
        </button>
        <button id="btn-break" class="btn btn-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
          Take a Break (5m)
        </button>
      </div>
      
      <button id="btn-work" class="link-subtle">Needed for work</button>
    </div>
  `;

  // Expose an updater function on the container
  (container as any).updateIntent = (intentText: string) => {
    if (intentOverlayState === 'analyzing') {
       intentOverlayState = 'question';
       renderQuestion(intentText);
    }
  };

  const removeOverlay = () => {
    isIntercepting = false;
    unlockScroll();
    container.remove();
  };

  const renderQuestion = (intentText?: string) => {
    contentNode.innerHTML = questionScreen(intentText);

    shadow.getElementById('btn-focus')?.addEventListener('click', () => {
      logDistraction('focus', 'blocked'); // Decided to retain focus
      unlockScroll();
      window.location.href = 'about:newtab';
    });

    shadow.getElementById('btn-break')?.addEventListener('click', () => {
      logDistraction('break', 'allowed'); // Took a break
      removeOverlay();
    });

    shadow.getElementById('btn-work')?.addEventListener('click', () => {
      logDistraction('work', 'allowed'); // Proceeded for work
      removeOverlay();
    });
  };

  renderAnalyzing();
};

handleIntercept();

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SPA_NAVIGATION') {
    handleIntercept();
  } else if (msg.type === 'INTENT_CLASSIFIED') {
    if (msg.failsafe) {
      logDebug('Failsafe triggered, showing fallback intent screen instead of unlocking');
      const container = document.getElementById('smart-focus-overlay');
      if (container && (container as any).updateIntent) {
        (container as any).updateIntent(); // Render question screen with unknown
      }
      return;
    }
    const container = document.getElementById('smart-focus-overlay');
    if (container && (container as any).updateIntent) {
      (container as any).updateIntent(msg.intent);
    }
  }
});

window.addEventListener('popstate', handleIntercept);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    handleIntercept();
  }
});

