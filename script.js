let questions = [];
let questionsAndAnswers = [];

const dots = document.querySelectorAll('.status-dot');
const statusLine = document.querySelector('.status-line');
const statusText = document.querySelector('.status-text');
const messages = [
    'Одну секундочку',
    'Еще чуть-чуть',
    'Ищем ответы...',
    'Загрузка завершена'
];

function updateStatus(percent) {
    const index = Math.min(Math.floor(percent / 25), 4);
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i <= index);
    });
    statusLine.style.transform = `scaleX(${percent / 100})`;
    statusText.textContent = messages[index] || messages[messages.length - 1];
    
    if (percent >= 100) {
        setTimeout(() => {
            document.getElementById('statusContainer').style.display = 'none';
            document.querySelector('.content-wrapper').style.display = 'flex';
        }, 500);
    }
}

// Загрузка вопросов из файла answers.json
fetch('answers.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка загрузки файла: ' + response.status);
        }
        const total = parseInt(response.headers.get('Content-Length'), 10);
        let loaded = 0;
        return new Response(
            new ReadableStream({
                start(controller) {
                    const reader = response.body.getReader();
                    function read() {
                        reader.read().then(({done, value}) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            loaded += value.length;
                            updateStatus((loaded / total) * 100);
                            controller.enqueue(value);
                            read();
                        });
                    }
                    read();
                }
            })
        ).json();
    })
    .then(data => {
        console.log('Ответ получен от сервера:', data);
        questionsAndAnswers = data.questions;
        questions = questionsAndAnswers.map(item => item.question);
        console.log('Вопросы успешно загружены:', questions);
        
        const input = document.getElementById("search");
        new Awesomplete(input, { list: questions });

        // Показываем контент-обертку после полной загрузки данных
        document.querySelector('.content-wrapper').style.display = 'flex';
        
        input.addEventListener("awesomplete-selectcomplete", function(event) {
            const selectedQuestion = event.text.value;
            const selectedItem = questionsAndAnswers.find(item => item.question === selectedQuestion);
            if (selectedItem && selectedItem.answers.length > 0) {
                const answerDisplay = document.getElementById("answer-display");
                answerDisplay.innerHTML = selectedItem.answers.map(answer => `<p>${answer}</p>`).join('');
                answerDisplay.style.display = 'block';
            } else {
                const answerDisplay = document.getElementById("answer-display");
                answerDisplay.style.display = 'none';
            }
        });
        
        // Скрываем статус-бар и показываем контент
        document.getElementById('statusContainer').style.display = 'none';
        document.querySelector('.content-wrapper').style.display = 'flex';
    })
    .catch(error => {
        console.error('Ошибка загрузки файла:', error);
        statusText.textContent = 'Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.';
    });

function clearInput() {
    const input = document.getElementById('search');
    input.value = '';
    document.getElementById("answer-display").style.display = 'none';
}
