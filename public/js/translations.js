app.config(function ($translateProvider) {
  	$translateProvider.translations('en', {
	    "TITLE": "Meetings",
	    "Login": "Login",
	    "Password": "Password",
	    "Sign in/Sign up": "Sign in/Sign up",
  	});
  	$translateProvider.translations('ru', {
	    "TITLE": "Встречи",
	    "Login": "Логин",
	    "Password": "Пароль",
	    "Sign in/Sign up": "Логин/Регистрация",
  	});
  	$translateProvider.preferredLanguage('en');
});