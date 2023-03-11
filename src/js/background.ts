class Background {
  private tabIds = new Map();

  constructor() {
    this.tabIds = new Map();

    chrome.storage.local.get('audio_only_bilibili_disabled', (values) => {
      let disabled = values.audio_only_bilibili_disabled;
      if (typeof disabled === 'undefined') {
        disabled = false;
        this.saveSettings(disabled);
      }

      if (disabled) {
        this.disableExtension();
      } else {
        this.enableExtension();
      }
    });

    chrome.action.onClicked.addListener(() => {
      chrome.storage.local.get('audio_only_bilibili_disabled', (values) => {
        let disabled = values.audio_only_bilibili_disabled;

        if (disabled) {
          this.enableExtension();
        } else {
          this.disableExtension();
        }

        disabled = !disabled;
        this.saveSettings(disabled);
      });

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
          url: '*://*.bilibili.com/*',
        },
        (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id!, { url: tabs[0].url });
          }
        }
      );
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'video-change':
          // onVideoChange()
          break;
        case 'disable-extension':
          this.saveSettings(true);
          this.disableExtension()
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const { id, url } = tabs[0] || {}
            id && chrome.tabs.update(id, {url});
          });
          break;
      }
    });
    
  }

  getPathname = (url: string) => {
    if (!url) return ''
    const u = new URL(url)
    return u.pathname
  }

  processRequest = (details: any) => {
    const { url, tabId } = details;
    // 音频码率对应 path name
    // 360p/480p: 30216.m4s.
    // 720p: 30232.m4s
    // 1080p: 30280.m4s
    const isAudioUrl = /.+bilivideo\.com\/upgcxcode.+(30280|30216|30232)\.m4s\?.+/.test(url)
    if (isAudioUrl) {
      const audioURL = url;
      const tabURL = this.tabIds.get(tabId)
      if (audioURL && this.getPathname(tabURL) !== this.getPathname(audioURL)) {
        console.log('bg set audio', this.getPathname(tabURL), this.getPathname(url))
        this.tabIds.set(tabId, audioURL);
        this.sendMessage(tabId);
      }
    }
  };

  sendMessage = (tabId: number) => {
    if (this.tabIds.has(tabId)) {
      chrome.tabs.sendMessage(tabId, {
        url: this.tabIds.get(tabId),
      });
    }
  };

  enableExtension = () => {
    chrome.action.setIcon({
      path: {
        // 19: 'img/icon19.png',
        128: '/img/icon128.png',
      },
    });
    chrome.tabs.onUpdated.addListener(this.sendMessage);
    chrome.webRequest.onBeforeRequest.addListener(
      this.processRequest,
      { urls: ['<all_urls>'] },
    );
  };

  disableExtension = () => {
    chrome.action.setIcon({
        path: {
          // 19: 'img/disabled_icon19.png',
          128: '/img/disabled_icon128.png'
        },
    });
    chrome.tabs.onUpdated.removeListener(this.sendMessage);
    chrome.webRequest.onBeforeRequest.removeListener(this.processRequest);
    this.tabIds.clear();
  };

  saveSettings = (disabled: boolean) => {
    chrome.storage.local.set({ audio_only_bilibili_disabled: disabled }); // eslint-disable-line
  };
}

const background = new Background();
