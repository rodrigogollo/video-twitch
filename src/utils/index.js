function asyncWrapper(fn) {
  return (req, res, next) => {
    return Promise.resolve(fn(req))
      .then((result) => res.send(result))
      .catch((err) => next(err));
  };
}

function time_convert(num) {
  var minutes = Math.floor(Math.round(num) / 60);
  var seconds = num % 60;
  if (minutes === 0) {
    return "00:" + pad(seconds.toFixed(0), 2);
  }
  return pad(minutes.toFixed(0), 2) + ":" + pad(seconds.toFixed(0), 2);
}

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

function swapItems(arr, a, b) {
  if (b < 0 || b > arr.length - 1) return arr;
  arr[a] = arr.splice(b, 1, arr[a])[0];
  return arr;
}

module.exports = {
  asyncWrapper,
  time_convert,
  pad,
  swapItems,
};
