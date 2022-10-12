//x5rule强力嗅探
function x5rule(jiexurl, srcurl) {
    showLoading("网页访问检索中，请稍候...");
    var video = 'webRule://' + jiexurl + '@' + $.toString((srcurl) => {
        //fba.log(fba.getUrls());
        var urls = _getUrls();
        if (window.__count == null || window.__count == undefined) {
            window.__count = 0
        }
        if (window.__count >= 23) {
            return srcurl
        }
        window.__count = window.__count + 1;
        if (window.__count > 1 && window.__count <= 3 && window.__count != null && window.__count != undefined) {
            if (document.querySelector('body').innerText.search(/触发了防盗链|未授权|接口防盗|请到主站观看/) != -1) {
                if (!srcurl) {
                	fba.log('尝试跳防盗验证一。');
                    location.href = location.href;
                } else {
                	fba.log('尝试跳防盗验证二。');
                    location.href = srcurl
                }
            };
        } else if(window.__count > 3 && window.__count != null && window.__count != undefined){
            if (urls.length < 1) {
                fba.hideLoading();
                return 'toast://检索失败，可能链接无法访问。';
            } else if (urls.length == 1) {
                fba.log('尝试直链与JSON解析');
                if (urls[0].match(/dycdn\-tos\.pstatp|\.m3u8|\.mp4|\.flv|netease\.com|video_mp4|type\=m3u8|pt\=m3u8|\/video\/tos\//) && !urls[0].match(/\.html|m3u8\.tv|m3u8\.pw|\&next|ac\=dm|\=http|\?http|https\:\/\/[\d]\.m3u8|\?url\=\/m3u8/)) {
                    //fy_bridge_app.log(urls[0])
                    if (urls[0].indexOf('bilivideo') != -1) {
                        return urls[0] + ';{Referer@https://www.bilibili.com&&User-Agent@Mozilla/5.0}';
                    } else if (urls[0].indexOf('titan.mgtv.com') != -1) {
                        return urls[0] + '#isVideo=true#' + ';{Referer@www.mgtv.com&&User-Agent@Mozilla/5.0}';
                    } else {
                        return urls[0]
                    };
                } else if (location.href.match(/dycdn\-tos\.pstatp|\.m3u8|\.mp4|\.flv|netease\.com|video_mp4|type\=m3u8|pt\=m3u8|\/video\/tos\//) && !location.href.match(/\.html|m3u8\.tv|m3u8\.pw|\&next|ac\=dm|\=http|\?http|https\:\/\/[\d]\.m3u8|\?url\=\/m3u8/)) {
                    return location.href;
                } else {
                    var html = fba.fetch(location.href, {});
                    if (!/\<meta/.test(html)&&!/\<html/.test(html)) {
                    var json=JSON.parse(html);
                     if(json.url){
                      return json.url;
                     }else if(json.data){
                      return json.data;
                     }else{
                     return json.play_url;
                     }
                    }else if(/没有找到站点|网页无法打开|404 Not Found|备案后可继续访问/.test(html)){
                    return location.href.substring(location.href.indexOf('=http') + 1);
                    }else{
                    return location.href}
                };
            } else {
                fba.log('日志检索第' + window.__count + '次');
                for (var i in urls) {
                    if (urls[i].match(/dycdn\-tos\.pstatp|\.m3u8|\.mp4|\.flv|netease\.com|video_mp4|type\=m3u8|pt\=m3u8|\/video\/tos\//) && !urls[i].match(/\.html|m3u8\.tv|m3u8\.pw|\&next|ac\=dm|\=http|\?http|https\:\/\/[\d]\.m3u8|\?url\=\/m3u8|\.css|\.js\?/)) {
                        //fy_bridge_app.log(urls[i])
                      if(fy_bridge_app.getHeaderUrl){
                        return fy_bridge_app.getHeaderUrl(urls[i]).replace(";{", "#ignoreImg=true##isVideo=true#;{");
                     } else {
                        if (urls[i].indexOf('bilivideo') != -1) {
                            return urls[i] + ';{Referer@https://www.bilibili.com&&User-Agent@Mozilla/5.0}';
                        } else if (urls[i].indexOf('titan.mgtv.com') != -1) {
                            return urls[i] + '#isVideo=true#' + ';{Referer@www.mgtv.com&&User-Agent@Mozilla/5.0}';
                        } else if (urls[i].indexOf('juhaokan') != -1) {
                            return urls[i] + ';{Referer@https://www.juhaokan.cc/}';
                        } else if (urls[i].indexOf('ojbk') != -1) {
                            return urls[i] + ';{Referer@https://v.ojbkjx.com/}';
                        } else if (urls[i].indexOf('wkfile') != -1) {
                            return urls[i] + ';{Referer@https://fantuan.wkfile.com/}';
                        } else if (urls[i].indexOf('shenglinyiyang') != -1) {
                            return urls[i] + ';{Referer@https://zyz.sdljwomen.com/}';
                        } else if (urls[i].indexOf('peizq.online') != -1) {
                            return urls[i] + ';{Referer@https://play.peizq.online/}';
                        } else {
                            return urls[i] + '#isVideo=true#'
                        }
                    }
                  }
                } //end for i
            }
        }
    }, srcurl);
    return video
}
//结束x5rule强力嗅探