const startBtn = document.querySelector('#start');
const stopBtn = document.querySelector('#stop');
const clearBtn = document.querySelector('#clear');
const logsContainer = document.querySelector('.logs');
let abort;
let logs = [];
var repeat;

const updateLogs = (arr) => {
  let data = arr.flat()
  logsContainer.insertAdjacentHTML('afterbegin', `<p class="log">${data[data.length - 1]}<p>`);
  if (data.length > 500) clear();
};


const ajax = function() {
  axios
    .get('/start')
    .then(res => {
      logs.push(Object.values(res.data));
      updateLogs(logs);
    })
    .catch(err => {
      console.error(err);
    });
};


let start = function() {
  if(abort) {
    clearInterval(repeat); // !!!!!!!
    return;
  }  
  let el = document.querySelector('input[name="interval"]');
  let int = parseInt(el.value);
  repeat = setInterval(ajax, int = 5000);
  logsContainer.insertAdjacentHTML('afterbegin', `<p class="log">START<p>`);
  abort = false;
};

const stop = function() {
  abort = true;
  logsContainer.insertAdjacentHTML('afterbegin', `<p class="log">STOP<p>`);
};

const clear = () => {
  logs = [];
  logsContainer.innerHTML = "";
}

startBtn.addEventListener('click', start);
stopBtn.addEventListener('click', stop);
clearBtn.addEventListener('click', clear);