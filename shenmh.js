/*
1.下面的示例中的注释说明可以重点看一下
2.公共在一级、二级界面可以直接调用，其他新开页面可以用传递参数的方式，或者用子页面调用的方法
3.子页面调用方法说明
    如取公共整个代码  let 公共 = $.require('jiekou').公共(标识);
    如取一级的作者 let 作者 = $.require('jiekou').属性("标识","一级","作者");
    标识为：类型_接口名
    标识在一级、二级、搜索均可直接和，如需要在新开页面调用可通过此取得let info = storage0.getMyVar('一级源接口信息');let 标识 = info.type + "_" + info.name;
    解析默认有第3个入参写入，如需在解析中取得标识，则参数.标识即可
4.接口分组可以留空，如写上分组名则影响搜索，如留空则搜索时会调用留空+全全的接口，如国漫则搜索会调用分组为国漫+全全的接口
5.一级主页源的接口如果同时拥有二级接口代码，则一级的d.url需要传二级链接地址，这样进二级时会自动打开当前接口的二级数据，否则默认进入搜索
6.搜索的desc如果要写其他内容，则在extra.sdesc传入最新章节名
7.视界搜索时可以在关键字后面加2个空格指定搜索接口，2个空格后留空则以当前主页源接口作为默认搜索接口
8.简繁互换内置方法jianfan(str)转为简体，jianfan(str,2)转为繁体
9.如果在新开页面，需要默认进入当前接口的二级，可以通过内置方法toerji进行转换
*/
let yidata = {
    "作者": "嗨又是我",//接口作者
    "页码": {"分类":1, "排行":0, "更新":0},//页码元素可不传，如果传1则会传fypage，用getParam('page')获取
    "主页": function () {
        //log(公共);
        let d = [];
        MY_URL = "https://m.kanman.com";
        let html = request(MY_URL);
        var Label_set = pdfa(html, '#js_content&&.mult.sow')
        Label_set.forEach((data) => {
            d.push({
                title: pdfh(data, 'h2&&Text'),
                col_type: "rich_text"
            });
            var item = pdfa(data, '.mult-warp.siw&&li.r1c3');
            item = item.length ? item : pdfa(data, '.mult-warp.siw&&li.r1c2');
            item.forEach((datas) => {
                d.push({
                    title: pdfh(datas, '.card-title&&Text'),
                    desc: pdfh(datas, '.card-text&&Text'),
                    pic_url: (item.length / 3) % 1 === 0 ? pd(datas, 'img&&data-src').replace('-300x400.jpg', '') : pd(datas, 'img&&data-src'),
                    col_type: (item.length / 3) % 1 === 0 ? "movie_3_marquee" : "movie_2",
                    url: pd(datas, 'a&&href')//如果只有主页源，这里就可以不用传url
                    //如果title不等于片名，则可以单独传extra.name
                });
            });
        });
        return d;
    },
    "分类": function () {
        let d = [];
        var 当前页 = getParam('page') || "1";
        var 类别 = MY_RULE.title + "类别"
        var 类别名 = getMyVar(类别, "");
        var 排序 = MY_RULE.title + "排序"
        var 排序名 = getMyVar(排序, "click");
        var class_Name = MY_RULE.title + "分类"
        if (当前页 == 1) {
            if (!getMyVar(class_Name)) {
                var codes = request('https://m.kanman.com/sort/');
                putMyVar(class_Name, codes)
            }else{
                var codes = getMyVar(class_Name)
            }
            var 分类项 = pdfa(codes, '.dl-sort-list&&a').map((data) => {
                var 项数据 = {};
                项数据.title = pdfh(data, 'Text')
                项数据.bs = pdfh(data, 'a&&href').replace('/sort/', '').replace('.html', '')
                项数据.sz = 项数据.bs == 类别名 ? true : false;
                return 项数据;
            })
            var 排序项 = pdfa(codes, '#js_orderList&&li').map((data) => {
                var 项数据 = {};
                项数据.title = pdfh(data, 'Text')
                项数据.bs = pdfh(data, 'li&&data-sort')
                项数据.sz = 项数据.bs == 排序名 ? true : false;
                return 项数据;
            })
            function List_of_options(数据源, 赋值名) {
                d.push({
                    col_type: 'blank_block'
                });
                数据源.forEach((data) => {
                    var title = data.title;
                    if (data.sz) {
                        title = '““””<b><font color=#FA7298>' + title + '</font></b>';
                    }
                    var url_qz = $("#noLoading#").lazyRule((list_name, Url) => {
                        putMyVar(list_name, Url)
                        refreshPage(false);
                        return "hiker://empty"
                    }, 赋值名, data.bs)
                    d.push({
                        title: title,
                        url: url_qz,
                        col_type: "scroll_button"
                    });
                })
            }
            List_of_options(分类项, 类别)
            List_of_options(排序项, 排序)
        }
        var 分类post = 'https://m.kanman.com/api/getsortlist/?product_id=3&productname=smh&platformname=wap&orderby=@@&search_key=&comic_sort=**&size=30&page=~~'
        var code = JSON.parse(request(分类post.replace('**', 类别名).replace('@@', 排序名).replace('~~', 当前页))).data.data;
        code.forEach((data) => {
            d.push({
                title: data.comic_name,
                desc: data.last_chapter_name,
                pic_url: data.cover_img + "@Referer=",
                col_type: "movie_3_marquee",
                url: 'https://m.kanman.com/'+data.comic_newid,//如果只有主页源，这里就可以不用传url
                extra: {
                    name: data.comic_name//如果title不等于片名，则可以单独传extra.name
                }
            });
        })
        return d;
    },
    "更新": function() {
        let d = [];
        let update_url = MY_RULE.title + "更新"
        if (!getMyVar(update_url)) {
            putMyVar(update_url, request("https://m.kanman.com/api/updatelist/?product_id=3&productname=smh&platformname=wap"))
        }
        let code = JSON.parse(getMyVar(update_url)).data.update
        let lisr_s = [];
        let update_date = MY_RULE.title + "更新日期"
        let date = getMyVar(update_date, '今天')
        code.forEach((data) => {
            var title = data.comicUpdateDate_new
            var url_qz = $("#noLoading#").lazyRule((update_date, title) => {
                putMyVar(update_date, title)
                refreshPage(false);
                return "hiker://empty"
            }, update_date, title)
            if (date == title) {
                setPageTitle(title);
                title = '““””<b><font color=#FA7298>' + title + '</font></b>';
                lisr_s = data.info;
            }
            d.push({
                title: title,
                url: url_qz,
                col_type: "scroll_button"
            });
        });
        lisr_s.forEach((data) => {
            d.push({//主页源不需要url
                title: '‘‘’’<b>'+data.comic_name+'</b> <small>\n最新：<font color="#FA7298">'+data.comic_chapter_name+'</font>\n作者：'+data.author_name+'</small>',
                desc:'‘‘’’<font color="#274c5e">分类：'+data.comic_type.join(" | ")+'\n简介：'+data.comic_feature+'</font>' ,
                pic_url: data.feature_img + "@Referer=https://m.kanman.com/",
                col_type: "movie_1_vertical_pic",
                url: 'https://m.kanman.com/'+data.comic_newid,//如果只有主页源，这里就可以不用传url
                extra: {
                    name : data.comic_name//如果title不等于片名，则可以单独传extra.name
                }
            });

        })
        return d;
    },
    "排行": function() {
        let d = [];
        let list_name = MY_RULE.title + "排行榜"
        let list_url = getMyVar(list_name, 'https://m.kanman.com/top/all.html');
        let code = request(list_url);
        let url_wzqz = 'https://m.kanman.com';
        MY_URL=url_wzqz;
        let list_class = pdfa(code, '#J_rankOptionMenu&&li')
        list_class.forEach((data) => {
            let title = pdfh(data, 'a&&Text')
            let url_qz = $("#noLoading#").lazyRule((list_name, Url) => {
                putMyVar(list_name, Url)
                refreshPage(false);
                return "hiker://empty"
            }, list_name, url_wzqz + pdfh(data, 'a&&href'))
            if (data.includes('active')) {
                setPageTitle(title);
                title = '““””<b><font color=#FA7298>' + title + '</font></b>';
            }
            d.push({
                title: title,
                url: url_qz,
                col_type: "scroll_button"
            });
        });
        pdfa(code, 'li.comic-rank-top&&.comic-item').forEach((data, id) => {
            d.push({//主页源不需要url
                title: pdfh(data, 'a&&title').split(',')[0],
                url: 'https://m.kanman.com'+pdfh(data, 'a&&href'),//如果只有主页源，这里就可以不用传url
                desc: '：第' + (id + 1) + '名',
                pic_url: 'https:'+pdfh(data, '.comic-cover&&data-src').replace('-300x400.jpg', '') + "@Referer=https://m.kanman.com/",
                col_type: "movie_3_marquee"
            });
        })
        pdfa(code, '.rank-comic-list&&.list').forEach(function(data) {
            d.push({//主页源不需要url
                title: '‘‘’’<b>' + pdfh(data, 'h3&&Text') + '</b> <small>&nbsp;&nbsp;&nbsp;&nbsp;排名：<font color="#FA7298"><b> ' + pdfh(data, '.order&&Text') + '  名</b></font>&nbsp;&nbsp;&nbsp;&nbsp;作者：' + pdfh(data, '.comic-author&&Text') + '</small>',
                desc: '‘‘’’<font color="#004e66">动态：' + pdfh(data, '.clearfix&&.statistics&&Text') + '&nbsp;&nbsp;&nbsp;&nbsp;分类：' + pdfa(data, '.sort-list&&a').map(datas => pdfh(datas, 'Text')).join(" | ") + '</font>',
                url: 'https://m.kanman.com'+pdfh(data, 'a&&href'),//如果只有主页源，这里就可以不用传url
                col_type: 'text_1',
                extra: {
                    name: pdfh(data, 'h3&&Text')//如果title不等于片名，则可以单独传extra.name
                }
            });
        });
        return d;
    }
}

let erdata = {
    "作者": "嗨又是我",//接口作者
    "搜索": function (name,page) {//聚合搜索换源列表数据，搜索关键字为name,页码为page
        let d = [];
        let ssurl = "https://m.kanman.com/api/getsortlist/?product_id=3&productname=smh&platformname=wap&orderby=click&search_key=" + name + "&page="+page+"&size=30";
        let code = JSON.parse(request(ssurl)).data.data
        code.forEach(item => {
            if (item.comic_name.includes(name)) {
                d.push({
                    title: item.comic_name,//名称
                    desc: item.last_chapter_name,//更新状态或最新章节
                    pic_url: item.cover_img + "@Referer=",//网站图标
                    url: "https://m.kanman.com/" + item.comic_newid,//原站二级链接,因为在多线程中MY_URL会变，所以不要用pd取
                });
            }
        });
        return d;
    },
    "二级": function(surl) {//surl为详情页链接
        let html = request(surl, {timeout:8000});
        let dataid = pdfh(html, "#COMMENT&&data-ssid");
        let 作者 = pdfh(html, '#detail&&.author&&Text');
        let 分类 = pdfa(html, '#detail&&.type').map(data => pdfh(data, 'Text')).join("  ");
        let 更新 = pdfh(html, '#js_chapter-reverse&&.update_time&&Text');
        let 简介 = pdfh(html, '#js_desc_content&&Text');
        let detail1 = "作者："+作者+"\n"+"分类："+分类;
        let detail2 = "时间："+更新;
        let 图片 = pd(html, '#detail&&.thumbnail&&img&&data-src');
        let 选集 = pdfa(html, '#js_chapters&&li').map((data) => {
            let 选集列表 = {};
            选集列表.title = pdfh(data, 'Text')
            选集列表.url = "https://m.kanman.com/api/getchapterinfov2?product_id=1&productname=kmh&platformname=wap&isWebp=1&quality=high&comic_id="+dataid+"&chapter_newid="+pdfh(data, 'a&&href').replace('.html', '').split('/')[2];
            return 选集列表;//列表数组含title和url就行
        })
        return { //如果有多线路，则传line: 线路数组, 则list应为多线路合并后的数组[线路1选集列表，线路2选集列表]
            detail1: "‘‘’’<font color=#FA7298>"+detail1+"</font>", 
            detail2: "‘‘’’<font color=#f8ecc9>"+detail2+"</font>", 
            desc: 简介,
            img: 图片, //图片也可以不传，则用上一级的原图片
            list: 选集 
        }//按格式返回
    },
    "解析": function(url) {//url为播放链接必传，小说的解析按第1个d.title写标题，第2个d.title写下载，确保小说可下载
        let code = JSON.parse(request(url, {timeout:8000})).data.current_chapter.chapter_img_list;
        return "pics://" + code.join("@Referer=https://m.kanman.com/&&") + '@Referer=https://m.kanman.com/';
    },
    "最新": function(url) {//收藏获取最新章节，surl为详情页链接
        return pdfh(request(url, {timeout:8000}), '#js_chapter-reverse&&.last-chapter&&Text');
    }
}

let ggdata = {
    host: "https://m.kanman.com"
}