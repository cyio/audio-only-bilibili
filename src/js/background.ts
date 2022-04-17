let count = 0
let sent = false

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

    chrome.browserAction.onClicked.addListener(() => {
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

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      switch (request.type) {
        case 'video-change':
          onVideoChange()
          break;
      }
    });
    
  }

  processRequest = (details: any) => {
    const { url, tabId } = details;
    // console.log(0, url)
    if (url.includes('bilivideo.com/upgcxcode')) {
      count++
      // console.log(1, url)
      // 第一个请求是视频，第二个请求是音频，取第二个
      if (count !== 2) {
        return
      }
    } else {
      return
    }
    // console.log(2, url)
    const audioURL = url;
    if (audioURL && this.tabIds.get(tabId) !== audioURL) {
      this.tabIds.set(tabId, audioURL);
      this.sendMessage(tabId);
    }
  };

  sendMessage = (tabId: number) => {
    if (this.tabIds.has(tabId)) {
      sent = true
      chrome.tabs.sendMessage(tabId, {
        url: this.tabIds.get(tabId),
      });
    }
  };

  enableExtension = () => {
    chrome.browserAction.setIcon({
      path: {
        // 19: 'img/icon19.png',
        128: 'img/icon128.png',
      },
    });
    chrome.tabs.onUpdated.addListener(this.sendMessage);
    chrome.webRequest.onBeforeRequest.addListener(
      this.processRequest,
      { urls: ['<all_urls>'] },
      // ["blocking"]
    );
  };

  disableExtension = () => {
    chrome.browserAction.setIcon({
      path: {
        // 19: 'img/disabled_icon19.png',
        128: 'img/disabled_icon128.png',
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

function onVideoChange() {
  count = 0
  sent = false
}

const background = new Background();
