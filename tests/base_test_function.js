const sleep = function(timeMills) {
  // eslint-disable-next-line no-undef
  return new Promise(resolve => setTimeout(resolve, timeMills));
}

window.sleep = sleep;
