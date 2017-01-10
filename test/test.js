var originalCodeFun = function (code, lang) {
    if (Setting.highlight == Constants.highlight) {
        return "<pre><code class='" + lang + "'>" + code + "</code></pre>";
    }
    return "<pre><code class='language-" + lang + "'>" + code + "</code></pre>";
};