app.config(function ($translateProvider) {
    $translateProvider.translations('en', {
	"TITLE": "Meetings",
	"Login": "Login",
	"Password": "Password",
	"Sign in/Sign up": "Sign in/Sign up",
        "Sign out": "Sign out",
        "Find": "Find",
    });
    $translateProvider.translations('ru', {
	"TITLE": "Meetings",
	"Login": "Логин",
	"Password": "Пароль",
	"Sign in/Sign up": "Логин/Регистрация",
        "Sign out": "Выход",
        "Find": "Найти",
    });
    $translateProvider.preferredLanguage(navigator.language);
});
