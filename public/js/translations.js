app.config(function ($translateProvider) {
  	$translateProvider.translations('en', {
	    TITLE: 'Meetings',
	    "Sign in/Sign up": "Sign in/Sign up",
  	});
  	$translateProvider.translations('ru', {
	    TITLE: 'Встречи',
	    "Sign in/Sign up": "Логин/Регистрация",
  	});
  	$translateProvider.preferredLanguage('en');
});