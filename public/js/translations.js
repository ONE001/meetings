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
    });
    $translateProvider.translations('ru', {
	"TITLE": "Meetings",
	"Login": "Логин",
	"Password": "Пароль",
	"Sign in/Sign up": "Логин/Регистрация",
        "Sign out": "Выход",
        "Find": "Найти",
        "Found people": "Найденные люди",
    });
});
