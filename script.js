// Загрузка вопросов из файла answers.json
fetch('answers.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Ошибка загрузки файла: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Ответ получен от сервера:', data);
        // Обработка полученных данных
        // Ваш код обработки данных здесь
        // Например, можно пройтись по массиву и извлечь нужные вам данные
        // Например:
        const questions = data.map(item => item.question);
        console.log('Вопросы успешно загружены:', questions);
        // Используем Awesomplete для создания автодополнения
        const input = document.getElementById("search");
        new Awesomplete(input, { list: questions });

        // Обработчик события выбора вопроса
        input.addEventListener("awesomplete-selectcomplete", function(event) {
            const selectedQuestion = event.text.value;
            const selectedAnswer = data.find(item => item.question === selectedQuestion)?.answer;
            if (selectedAnswer) {
                const answerDisplay = document.getElementById("answer-display");
                answerDisplay.textContent = selectedAnswer;
                answerDisplay.style.display = 'block'; // Показываем блок с ответом
            } else {
                const answerDisplay = document.getElementById("answer-display");
                answerDisplay.style.display = 'none'; // Скрываем блок с ответом, если ответа нет
            }
        });
    })
    .catch(error => {
        console.error('Ошибка загрузки файла:', error);
    });


// Обработчик события выбора вопроса
input.addEventListener("awesomplete-selectcomplete", function(event) {
    const selectedQuestion = event.text.value;
    const selectedAnswer = data.find(item => item.question === selectedQuestion)?.answer;
    if (selectedAnswer) {
        const answerDisplay = document.getElementById("answer-display");
        answerDisplay.textContent = selectedAnswer;
        answerDisplay.style.display = 'block'; // Показываем блок с ответом
    } else {
        const answerDisplay = document.getElementById("answer-display");
        answerDisplay.style.display = 'none'; // Скрываем блок с ответом, если ответа нет
    }
});

function clearInput() {
  document.getElementById('search').value = ''; // Очистка поля ввода
}

