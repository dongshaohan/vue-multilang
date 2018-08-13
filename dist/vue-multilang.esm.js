/**
 * VueMultiLang v1.0
 * (c) 2018 dongshaohan
 * @license MIT
 */

'use strict';
var extend = function (to, from) {
    for (var key in from) {
        to[key] = from[key];
    }
    return to;
};

var VueMultiLang = function (options) {
    if (options === void 0) options = {};

    var defaultOpt = {
        lang: [], // 项目需要配置的语言码集合 *必填
        path: "", // 语言包地址
        defaultLang: "en", // 容错处理 设置默认语言 防止匹配不到语言码最后为空
        version: "1", // 语言包版本号
        langUrlRegExp: /\blang=(.+?)\b/i, // URL语言码匹配规则
        langUaRegExp: /\blang\/(.+?)\b/i, // UA语言码匹配规则
        locationUrlRegExp: /\blocation=(.+?)\b/i, // URL国家码匹配规则
        locationUaRegExp: /\blocation\/(.+?)\b/i, // UA国家码匹配规则
        rtlList: ['ar'], // 阅读习惯从右到左集合
        dataType: "json", // 语言文件类型
        callback: function () {} // 加载成功后回调
    };
    this.options = extend(defaultOpt, options);
    this.settings = { // 保存数据
        isReady: false,
        langObj: {},
        list: []
    };
};

/**
 * 浏览器语言
 */
VueMultiLang.prototype.langZip = {
    'cn': 'cn,zh,zh-hans,zh-cn,zh-hans-cn,zh-sg,zh-hans-sg',
    'tw': 'tw,zh-hant,zh-hk,zh-mo,zh-tw,zh-hant-hk,zh-hant-mo,zh-hant-tw',
    'en': 'en,en-au,en-bz,en-ca,en-cb,en-ie,en-jm,en-nz,en-ph,en-za,en-tt,en-gb,en-us,en-zw,en-sg',
    'th': 'th,th-th',
    'vi': 'vn,vi-vn,vi,vn-vn',
    'ru': 'ru,ru-ru,ru-mo',
    'id': 'id,id-id,in-id',
    'ko': 'ko,ko-kr',
    'hi': 'in,hi,hi-in',
    'sg': 'sg',
    'ar': 'ar,ar-er,ar-sa,ar-eg,ar-dz,ar-tn,ar-ye,ar-jo,ar-kw,ar-bh,ar-iq,ar-ly,ar-ma,ar-om,ar-sy,ar-lb,ar-ae,ar-qa,ar-ss,ar-il',
    'af': 'af,af-za',
    'tr': 'tr,tr-tr',
    'es': 'es,es-ar,es-bo,es-cl,es-co,es-cr,es-do,es-ec,es-es,es-gt,es-hn,es-mx,es-ni,es-pa,es-pe,es-pr,es-py,es-sv,es-uy,es-ve,es-xl',
    'ms': 'ms,ms-bn,ms-my,my',
    'pt': 'pt,pt-pt,pt-br',
    'ja': 'ja,ja-jp,ja-ja,jp,jp-jp',
    'ur': 'ur,ur-pk',
    'de': 'de,de-at,de-ch,de-de,de-li,de-lu',
    'ne': 'ne,ne-np',
    'bn': 'bn,bn-bd,bn-in'
};

/**
 * @param app - Vue component instance
 */
VueMultiLang.prototype.initLang = function (app) {
    var $this = this;
    var langObj = this.getLangCode();

    // 阿拉伯语阅读习惯是从右到左
    if (this.options.rtlList.indexOf(langObj.lang) != -1) {
        document.documentElement.setAttribute('dir', 'rtl');
    }

    this.add(this.options.callback);

    app._langUtil = {
        langCode: langObj.lang,
        countryCode: langObj.countryCode,
        onReady: function (fn) {
            $this.onReady(fn);
        },
        template: function (key) {
            return $this.template.call($this, key, arguments);
        }
    };
    for (var k in app._langUtil) {
        this.setLangCache(k, app._langUtil[k]);
    }
    // 因为langObj保存着ajax回调数据 会异步 采用双向数据监听方式
    Object.defineProperty(app._langUtil, 'langObj', {
        configurable: true,
        get: function () {
            return $this.settings['langObj'];
        },
        set: function (value) {
            $this.settings['langObj'] = value;
        }
    });

    this.getFiles(this.options.path + '/' + langObj.lang + '.json?v=' + this.options.version);
};

/**
 * 获取URL或者浏览器信息中的语言码并转成短码
 * @returns {{lang: string, countryCode: string}}
 */
VueMultiLang.prototype.getLangCode = function () {
    var langFromUrl = this.getLangFromUrl();
    var langFromApp = this.getLangFromUA();

    var langCode = (langFromUrl.lang || langFromApp.lang || navigator.language || navigator.userLanguage).toLowerCase();
    var countryCode = langFromUrl.countryCode || langFromApp.countryCode || '';

    // 在lang字段中没有直接找到，则自动匹配langZip
    if (this.options.lang && this.options.lang.indexOf(langCode) == -1) {
        var reg = new RegExp('\\b' + langCode + '\\b', 'i');

        langCode = this.options.defaultLang; // 设置默认语言

        for (var i in this.langZip) {
            if (this.langZip[i].match(reg)) {
                langCode = i;
                break;
            }
        }
    }

    return {
        lang: langCode,
        countryCode: countryCode
    }
};

/**
 * 从URL参数中取出指定语言码字段
 * @returns {{lang: string, countryCode: string}}
 */
VueMultiLang.prototype.getLangFromUrl = function () {
    var search = window.location.search.toLocaleLowerCase();
    var lang = search.match(this.options.langUrlRegExp);
    var location = search.match(this.options.locationUrlRegExp);

    return {
        lang: lang && lang[1],
        countryCode: location && location[1]
    };
};

/**
 * 从userAgent取出指定语言码字段
 * @returns {{lang: string, countryCode: string}}
 */
VueMultiLang.prototype.getLangFromUA = function () {
    var userAgent = window.navigator.userAgent.toLocaleLowerCase();
    var lang = userAgent.match(this.options.langUaRegExp);
    var location = userAgent.match(this.options.locationUaRegExp);

    return {
        lang: lang && lang[1],
        countryCode: location && location[1]
    };
};

/**
 * @param requestUrl 请求资源路径
 */
VueMultiLang.prototype.getFiles = function (requestUrl) {
    var xmlhttp = {}, $this = this;
    if (window.XMLHttpRequest) {
        xmlhttp = new window.XMLHttpRequest();
    } else {
        xmlhttp = new window.ActiveXObject('Microsoft.XMLHTTP');
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                try {
                    var data = $this.options.dataType === 'txt' ? xmlhttp.responseText : JSON.parse(xmlhttp.responseText);
                    $this.resolve(data);
                } catch (e) {
                    alert('bad lang file');
                }
            } else {
                alert('Get lang error');
            }
        }
    };
    xmlhttp.onabort = function () {
        alert('Network error. Please refresh this page.');
    };
    xmlhttp.open('GET', requestUrl);
    xmlhttp.send();
};

/**
 * 订阅器
 * @param fn
 */
VueMultiLang.prototype.add = function (fn) {
    if (typeof fn === 'function') {
        this.settings.list.push(fn);
    }
};

/**
 * 发布器
 * @param data
 */
VueMultiLang.prototype.resolve = function (data) {
    this.settings.langObj = data;
    this.settings.isReady = true;
    this.setLangCache('langObj', data);
    this.settings.list.forEach(function (cb) {
        cb && cb(data);
    });
    this.settings.list = [];
};

/**
 * 语言包加载完毕后的回调
 * @param fn
 */
VueMultiLang.prototype.onReady = function (fn) {
    if (typeof fn !== 'function') {
        fn = function () {};
    }
    if (this.settings.isReady) {
        fn && fn();
    } else {
        this.add(fn);
    }
};

/**
 * 模板内容替换
 * @param key 语言包字段
 * @param args
 * @returns {json}
 */
VueMultiLang.prototype.template = function (key, args) {
    var len = args.length;
    var str = this.settings.langObj[key] || '';
    for (var i = 1; i < len; i++) {
        str = str.replace(/%s/, args[i]);
    }
    return str;
};

/**
 * 设置全局缓存
 * @param key
 * @param value
 */
VueMultiLang.prototype.setLangCache = function (key, value) {
    window.$multiLang = window.$multiLang || {};
    window.$multiLang[key] = value;
};

var _Vue;

function install(Vue) {
    if (install.installed && _Vue === Vue) {
        return;
    }
    install.installed = true;

    _Vue = Vue;

    var isDef = function (v) {
        return v !== undefined;
    };

    Vue.mixin({
        beforeCreate: function () {
            if (isDef(this.$options['multiLang'])) {
                this._langRoot = this;
                this._langLoader = this.$options['multiLang'];
                this._langLoader.initLang(this);
            } else {
                this._langRoot = (this.$parent && this.$parent._langRoot) || this;
            }
        },
        destroyed: function () {
            this._langRoot = null;
            this._langLoader = null;
        }
    });

    Object.defineProperty(Vue.prototype, '$lang', {
        get: function get() {
            return this._langRoot['_langUtil'];
        }
    });
}

VueMultiLang.install = install;
VueMultiLang.version = '1.0';

var inBrowser = typeof window !== 'undefined';
if (inBrowser && window.Vue) {
    window.Vue.use(VueMultiLang);
}

export default VueMultiLang;