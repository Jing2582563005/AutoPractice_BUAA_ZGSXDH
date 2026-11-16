// ==UserScript==
// @name         雨课堂中国式现代化刷题（手动提交测试版）
// @namespace    local.chinese.modernization
// @version      0.3
// @description  根据本地题库选择答案；由用户手动提交
// @match        https://www.yuketang.cn/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function () {
  'use strict';
  // 题目实际位于 iframe；外层课程页不创建面板。
  if (window.top === window) return;
  const names = ["第一讲","第二讲","第三讲","第四讲","第五讲","第六讲","第七讲","第八讲","第九讲","结语"];
  const bank = {"1":{"1":"C","2":"A","3":"B","4":"B","5":"B","6":"B","7":"B","8":"C","9":"B","10":"B","11":"C","12":"C","13":"D","14":"B","15":"C","16":"B","17":"C","18":"B","19":"B","20":"B","21":"ABCD","22":"ABC","23":"ABC","24":"ABCD","25":"ABCD","26":"AB","27":"ABC","28":"ABCD","29":"ABCD","30":"ABCD","31":"F","32":"F","33":"T","34":"T","35":"T","36":"T","37":"F","38":"T","39":"F","40":"T"},"2":{"1":"B","2":"C","3":"B","4":"D","5":"D","6":"B","7":"A","8":"B","9":"C","10":"D","11":"C","12":"C","13":"C","14":"D","15":"C","16":"A","17":"B","18":"D","19":"A","20":"B","21":"ABC","22":"ABCD","23":"ACD","24":"ABCD","25":"ABCD","26":"AC","27":"AB","28":"ABC","29":"ABCD","30":"BC","31":"T","32":"F","33":"F","34":"T","35":"F","36":"F","37":"T","38":"T","39":"F","40":"T"},"3":{"1":"B","2":"B","3":"D","4":"B","5":"B","6":"A","7":"B","8":"B","9":"D","10":"A","11":"B","12":"A","13":"B","14":"B","15":"A","16":"A","17":"B","18":"A","19":"B","20":"A","21":"ABCD","22":"ABCD","23":"ABCD","24":"ABC","25":"ABCD","26":"ABC","27":"ABD","28":"AC","29":"ABCD","30":"ABC","31":"ABC","32":"T","33":"T","34":"F","35":"T","36":"F","37":"F","38":"F","39":"T","40":"F"},"4":{"1":"B","2":"B","3":"A","4":"B","5":"A","6":"C","7":"A","8":"C","9":"A","10":"B","11":"A","12":"A","13":"C","14":"B","15":"B","16":"C","17":"C","18":"A","19":"A","20":"B","21":"BCD","22":"ABCD","23":"ABC","24":"ABD","25":"ACD","26":"ABC","27":"ABD","28":"ABD","29":"ABCD","30":"BCD","31":"T","32":"T","33":"F","34":"F","35":"F","36":"T","37":"F","38":"T","39":"F","40":"T"},"5":{"1":"C","2":"B","3":"B","4":"B","5":"C","6":"B","7":"B","8":"D","9":"C","10":"B","11":"B","12":"C","13":"B","14":"C","15":"B","16":"A","17":"B","18":"C","19":"ABC","20":"ABD","21":"ACD","22":"ABC","23":"ABC","24":"ABC","25":"ABC","26":"AB","27":"ABD","28":"ABD","29":"AB","30":"ABC","31":"ABD","32":"ABC","33":"T","34":"T","35":"F","36":"F","37":"F","38":"T","39":"T","40":"F","41":"T"},"6":{"1":"B","2":"C","3":"C","4":"B","5":"C","6":"B","7":"D","8":"B","9":"D","10":"B","11":"C","12":"B","13":"B","14":"B","15":"A","16":"C","17":"B","18":"D","19":"D","20":"A","21":"ABCD","22":"ABCD","23":"ABCD","24":"BD","25":"ABD","26":"ABCD","27":"AB","28":"AB","29":"ABD","30":"AB","31":"F","32":"F","33":"F","34":"F","35":"T","36":"T","37":"T","38":"F","39":"T","40":"T"},"7":{"1":"A","2":"B","3":"C","4":"A","5":"B","6":"C","7":"D","8":"A","9":"B","10":"C","11":"D","12":"A","13":"B","14":"C","15":"D","16":"A","17":"B","18":"C","19":"D","20":"A","21":"B","22":"C","23":"D","24":"A","25":"B","26":"ABC","27":"ABCD","28":"ABC","29":"ABCD","30":"ABCD","31":"ABCD","32":"ABCD","33":"ABCD","34":"ABC","35":"ABCD","36":"ABCD","37":"ABCD","38":"ABCD","39":"ABCD","40":"ABCD"},"8":{"1":"B","2":"C","3":"D","4":"A","5":"B","6":"A","7":"D","8":"A","9":"C","10":"A","11":"D","12":"B","13":"B","14":"A","15":"C","16":"T","17":"F","18":"T","19":"T","20":"F","21":"T","22":"T","23":"F","24":"T","25":"T","26":"F","27":"T","28":"T","29":"T","30":"T","31":"T","32":"T","33":"T","34":"T","35":"T","36":"ABCD","37":"ABCD","38":"ABCD","39":"ABCD","40":"ABC"},"9":{"1":"B","2":"C","3":"C","4":"C","5":"B","6":"B","7":"D","8":"C","9":"B","10":"B","11":"B","12":"C","13":"B","14":"D","15":"B","16":"D","17":"B","18":"A","19":"A","20":"C","21":"C","22":"ABC","23":"ABCD","24":"ABC","25":"ABCD","26":"ABC","27":"ABC","28":"ABCD","29":"ABCD","30":"ABC","31":"F","32":"T","33":"T","34":"F","35":"T","36":"T","37":"T","38":"F","39":"T","40":"T"},"10":{"1":"C","2":"D","3":"ABCD","4":"T","5":"F","6":"F","7":"T","8":"T"}};
  let pending = null;
  let stopped = false;
  function visible(el) { return !!(el && el.getClientRects().length); }
  function lectureNumber() {
    let title = '';
    try {
      const p = window.parent.document;
      title = p.querySelector('.control-left .unit-title')?.textContent
        || p.querySelector('.unit-title')?.textContent
        || p.querySelector('.leaf-item.is-active .leaf-item-title')?.textContent || '';
    } catch (_) {}
    const m = title.match(/第([一二三四五六七八九十])讲/) || title.match(/(结语)/);
    if (m) return names.indexOf(m[0]) + 1;
    return null;
  }
  const panel = document.createElement('div');
  panel.style.cssText = 'position:fixed;right:20px;top:75px;z-index:2147483647;background:#fff;color:#222;border:2px solid #3976ec;border-radius:8px;padding:10px 14px;font:14px sans-serif;box-shadow:0 2px 12px #888;max-width:360px';
  document.body.appendChild(panel);
  function status(message) { panel.textContent = '中国式现代化自动答题：' + message; }
  function stop(message) { stopped = true; status(message); }
  function button(label) {
    return [...document.querySelectorAll('.problem-box button')].find(x =>
      visible(x) && x.textContent.trim() === label && !x.disabled);
  }
  function tick() {
    if (stopped) return;
    const item = [...document.querySelectorAll('.subject-item')].find(x => visible(x) && x.querySelector('.item-type'));
    if (!item) { status('等待作业题目加载'); return; }
    const heading = item.querySelector('.item-type')?.textContent || '';
    const question = heading.match(/(\d+)\s*[.．、]/) || document.querySelector('.problems-aside .is-active')?.textContent.match(/\d+/);
    const lecture = lectureNumber();
    if (!lecture || !question) { stop(`识别失败：讲次=${lecture || '未知'}，题号=${question?.[1] || '未知'}`); return; }
    const n = +question[1], key = lecture + ':' + n;
    const active = document.querySelector('.problems-aside .subject-item.active');
    const completed = !!active?.querySelector('.status-container .success, .status-container .error, .status-container .wrong');
    const graded = completed || /正确答案[:：]/.test(item.textContent);
    if (pending) {
      if (pending.key !== key) pending = null;
      else if (pending.phase === 'next') {
        if (Date.now() - pending.time > 8000) stop(`第${lecture}讲第${n}题后未进入下一题`);
        return;
      } else if (graded) {
        const next = button('下一题');
        if (next) { pending = {key, time:Date.now(), phase:'next'}; next.click(); status(`第${lecture}讲第${n}题已完成，进入下一题`); return; }
        stop(`第${lecture}讲作业已结束`); return;
      } else if (Date.now() - pending.time > 12000) { stop(`第${lecture}讲第${n}题提交后页面未前进，请检查`); return; }
      else { status(`第${lecture}讲第${n}题等待提交结果`); return; }
    }
    if (graded) {
      const next = button('下一题');
      if (next) { pending = {key,time:Date.now(),phase:'next'}; next.click(); status(`跳过已完成的第${n}题`); return; }
      stop(`第${lecture}讲作业已结束`); return;
    }
    const answer = bank[lecture]?.[n];
    if (!answer) { stop(`第${lecture}讲第${n}题无题库答案`); return; }
    const options = [...item.querySelectorAll('label.el-radio, label.el-checkbox')].filter(visible);
    if (!options.length) { status(`第${lecture}讲第${n}题：尚未找到选项`); return; }
    const isJudge = /判断/.test(heading);
    if (isJudge !== /^[TF]$/.test(answer)) { stop(`第${lecture}讲第${n}题题型与答案不符`); return; }
    const letters = answer === 'T' ? ['true'] : answer === 'F' ? ['false'] : [...answer];
    const selected = options.filter(x => letters.includes(x.querySelector('input')?.value));
    if (selected.length !== letters.length || options.length < 2) { stop(`第${lecture}讲第${n}题选项与题库不符`); return; }
    const isMulti = /多选/.test(heading);
    if ((isMulti && options.some(x=>!x.classList.contains('el-checkbox'))) || (!isMulti && letters.length > 1)) {
      stop(`第${lecture}讲第${n}题题型与答案不符`); return;
    }
    for (const option of options) {
      const should = selected.includes(option);
      const checked = option.querySelector('input')?.checked === true
        || option.classList.contains('is-checked');
      if (should !== checked) { option.click(); status(`第${lecture}讲第${n}题选择 ${answer}`); return; }
    }
    const submit = button('提交');
    if (!submit) { stop(`第${lecture}讲第${n}题提交按钮不可用`); return; }
    status(`第${lecture}讲第${n}题已选 ${answer}；请手动提交`);
  }
  setInterval(tick, 900);
  tick();
})();
