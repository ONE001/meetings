app.config(function ($translateProvider) {
    var lang = /[a-z]{2}/.exec(navigator.language);

    if (lang) lang = lang[0].toLowerCase();
    else lang = "en";

    $translateProvider.preferredLanguage(lang);

    $translateProvider.translations('en', {
	"TITLE": "Meetings",
	"Login": "Login",
	"Password": "Password",
	"Sign in/Sign up": "Sign in/Sign up",
        "Sign out": "Sign out",
        "Find": "Find",
        "Found people": "Found people",
        "wants_add_you": "wants add you as a friend",
        "Send": "Send",
        "full screen": "Full screen",
        "add people": "Add people",
        "Addition people": "Addition people",
        "Close": "Close",
        "unread messages in chat": "Unread messages in the chat",
        "footer": '',
    });
    $translateProvider.translations('ru', {
	"TITLE": "Meetings",
	"Login": "Логин",
	"Password": "Пароль",
	"Sign in/Sign up": "Логин/Регистрация",
        "Sign out": "Выход",
        "Find": "Найти",
        "Found people": "Найденные люди",
        "wants_add_you": "хочет добавить вас в друзья",
        "Send": "Отправить",
        "full screen": "На весь экран",
        "add people": "Добавить людей",
        "Addition people": "Добавление людей",
        "Close": "Отмена",
        "unread messages in chat": "Имеются непрочитанные сообщения в чате",
        "footer": '',
    });
});
