
// Функция для загрузки JSON с вопросами и ответами
async function loadAnswers() {
    const response = await fetch('https://raw.githubusercontent.com/Over1Cloud/mira.github.io/main/answers.json');
    return response.json();
}

// Основная функция для парсинга страницы и обновления ответов
async function parsePage() {
    const answersData = await loadAnswers();

    setInterval(() => {
        // Получаем текст страницы
        const pageText = document.body.innerText;

        // Проходим по вопросам из JSON
        answersData.questions.forEach(questionObj => {
            const question = questionObj.question;
            const answers = questionObj.answers;

            // Проверяем, есть ли на странице вопрос
            if (pageText.includes(question)) {
                // Если есть, ищем ответ
                answers.forEach(answer => {
                    const answerElements = document.querySelectorAll('body *:not(script):not(style)');

                    answerElements.forEach(element => {
                        if (element.innerText.includes(answer)) {
                            // Меняем цвет текста ответа на зеленый
                            element.style.color = 'green';
                        }
                    });
                });
            }
        });
    }, 1000); // Интервал проверки в миллисекундах
}

// Запуск парсинга после загрузки страницы
window.onload = parsePage;
