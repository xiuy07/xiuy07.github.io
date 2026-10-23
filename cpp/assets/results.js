/* Local result import validation, shared by the page and the Node regression. */
(() => {
  'use strict';
  function parse(result, allowed) {
    if (!result || result.version !== 1 || !Array.isArray(result.results)) {
      throw Error('结果格式不正确，请选择评测器生成的 local-results.json。');
    }
    if (result.reference === true) {
      throw Error('这是参考解结果，不计入你自己的完成进度。');
    }
    if (result.reference !== false) {
      throw Error('结果缺少个人评测标记，请用本地评测器重新生成。');
    }
    const statuses = new Set(['AC', 'WA', 'CE', 'RE', 'TLE', 'OLE', 'MISSING', 'ERROR']);
    const latest = new Map();
    for (const item of result.results) {
      if (item && allowed.has(item.id) && statuses.has(item.status)) {
        latest.set(item.id, { id: item.id, status: item.status });
      }
    }
    return [...latest.values()];
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { parse };
  else window.CPP_RESULTS = { parse };
})();
