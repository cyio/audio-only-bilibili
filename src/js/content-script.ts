let originalVideoElementStyle: any = null;

function getMeta(attrKey: string, metaName: string) {
  const metas = document.getElementsByTagName('meta');

  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute(attrKey) === metaName) {
      return metas[i].getAttribute('content');
    }
  }

  return '';
}

async function setBackgroundImage(videoElement: HTMLVideoElement) {
  if (!originalVideoElementStyle) {
    originalVideoElementStyle = {
      background: videoElement.style.background,
      backgroundSize: videoElement.style.backgroundSize,
    }
  }

  const bgUrl = getMeta('itemprop', 'image')
  videoElement.style.background = `transparent url(${bgUrl}) no-repeat center / cover`;
  videoElement.style.opacity = '0.3';
}

function showAudioOnlyInformation(videoElement: HTMLVideoElement) {
  const el = document.querySelector('.audio_only_div')
  if (el && el.parentNode) {
    el.parentNode.removeChild(el)
  }
  if (1) {
    const extensionAlert = document.createElement('div');
    extensionAlert.className = 'audio_only_div';

    const alertText = document.createElement('p');
    alertText.className = 'alert_text';
    alertText.innerHTML =
      '音频模式<br>' +
      '<div class="small">点击扩展图标切换模式</div>';

    extensionAlert.appendChild(alertText);
    const videoParent = videoElement.parentNode;
    if (!videoParent) return;

    const parent = videoParent.parentNode;
    if (parent) {
      parent.appendChild(extensionAlert);
    }
  }
}

function removeBackgroundImage(videoElement: HTMLVideoElement) {
  if (!originalVideoElementStyle) {
    return;
  }

  videoElement.style.background = originalVideoElementStyle.background;
}

function removeAudioOnlyInformation() {
  const elements = document.getElementsByClassName('audio_only_div');
  if (!elements.length) return;
  Array.from(elements).forEach(function(element) {
    element.remove();
  });
}

function removeVideoPlayerStyling(videoElement: HTMLVideoElement) {
  removeBackgroundImage(videoElement);
  removeAudioOnlyInformation();
}

function applyVideoPlayerStyling(videoElement: HTMLVideoElement) {
  chrome.storage.sync.get({ showThumbnail: true }, function(item) {
    if (item.showThumbnail) {
      setBackgroundImage(videoElement);
    }
  });

  showAudioOnlyInformation(videoElement);
}

function makeSetAudioURL(videoElement: HTMLVideoElement, url: string) {
  function setAudioURL() {
    if (url === '' || videoElement.src === url) {
      return;
    }

    videoElement.pause();
    videoElement.src = url;
    videoElement.currentTime = 0;
    videoElement.play();
    console.log('完成替换')
  }
  return setAudioURL;
}

function handleUrl(url: string) {
  const videoElements = window.document.getElementsByTagName('video');
  const videoElement = videoElements[0];
  if (typeof videoElement == 'undefined') {
    console.log('Audio Only bilibili - Video element undefined in this frame!');
    return;
  }
  const videoRect = videoElement.getBoundingClientRect();
  if (videoRect.width === 0 && videoRect.height === 0) {
    console.log('Audio Only bilibili - Video element not visible!');
    return;
  }

  videoElement.onloadeddata = makeSetAudioURL(videoElement, url);
  if (url) {
    applyVideoPlayerStyling(videoElement);
  } else {
    removeVideoPlayerStyling(videoElement);
  }

}

chrome.runtime.onMessage.addListener((request) => {
  const url = request.url;
  // console.log('audio content listen: ', url)
  handleUrl(url)
});

document.addEventListener('DOMContentLoaded', () => {
  watchVideoChange();
})

// 视频播放切换是单页刷新，不能通过 pushState 监听到，这里改用 MutationObserver 观察视频标题
function watchVideoChange() {
    // 选择需要观察变动的节点
  const targetNode = document.getElementById('video-title');
  if (!targetNode) return

  // 观察器的配置（需要观察什么变动）
  const config = { attributes: true, childList: true, subtree: true };

  // 当观察到变动时执行的回调函数
  const callback = function(mutationsList: any, observer: any) {
      // Use traditional 'for loops' for IE 11
      for(let mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'title')
            chrome.runtime.sendMessage({type: "video-change", data: location.href})
            // console.log('The ' + mutation.attributeName + ' attribute was modified.');
          }
      }
  };

  // 创建一个观察器实例并传入回调函数
  const observer = new MutationObserver(callback);

  // 以上述配置开始观察目标节点
  observer.observe(<HTMLElement>targetNode, config);
}