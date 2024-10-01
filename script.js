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
    // Ограничиваем процент до 100
    percent = Math.min(percent, 100);
    
    const index = Math.min(Math.floor(percent / 25), 3);
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i <= index);
    });
    if (statusLine) {
        statusLine.style.transform = `scaleX(${percent / 100})`;
    }
    if (statusText) {
        statusText.textContent = messages[index] || messages[messages.length - 1];
    }
    
    if (percent >= 100) {
        setTimeout(() => {
            const statusContainer = document.getElementById('statusContainer');
            const contentWrapper = document.querySelector('.content-wrapper');
            if (statusContainer) {
                statusContainer.style.display = 'none';
            }
            if (contentWrapper) {
                contentWrapper.style.display = 'flex';
            }
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
        if (input) {
            new Awesomplete(input, { list: questions });

            input.addEventListener("awesomplete-selectcomplete", function(event) {
                const selectedQuestion = event.text.value;
                const selectedItem = questionsAndAnswers.find(item => item.question === selectedQuestion);
                const answerDisplay = document.getElementById("answer-display");
                if (answerDisplay) {
                    if (selectedItem && selectedItem.answers.length > 0) {
                        answerDisplay.innerHTML = selectedItem.answers.map(answer => `<p>${answer}</p>`).join('');
                        answerDisplay.style.display = 'block';
                    } else {
                        answerDisplay.style.display = 'none';
                    }
                }
            });
        }
        
        // Скрываем статус-бар и показываем контент
        const statusContainer = document.getElementById('statusContainer');
        const contentWrapper = document.querySelector('.content-wrapper');
        if (statusContainer) {
            statusContainer.style.display = 'none';
        }
        if (contentWrapper) {
            contentWrapper.style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Ошибка загрузки файла:', error);
        if (statusText) {
            statusText.textContent = 'Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.';
        }
    });

function clearInput() {
    const input = document.getElementById('search');
    const answerDisplay = document.getElementById("answer-display");
    if (input) {
        input.value = '';
        // Сбрасываем Awesomplete
        if (input.awesomplete) {
            input.awesomplete.evaluate();
        }
    }
    if (answerDisplay) {
        answerDisplay.style.display = 'none';
    }
}

// Добавляем обработчик события для кнопки очистки
document.addEventListener('DOMContentLoaded', function() {
    const clearButton = document.querySelector('.clear-input');
    if (clearButton) {
        clearButton.addEventListener('click', clearInput);
    }
});
