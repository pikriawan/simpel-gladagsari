import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../wayfinder'
/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
export const login = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

login.definition = {
    methods: ["get","head"],
    url: '/login',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
login.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: login.url(options),
    method: 'head',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url(options),
    method: 'get',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::login
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:47
* @route '/login'
*/
loginForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: login.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

login.form = loginForm

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

/**
* @see \Laravel\Fortify\Http\Controllers\AuthenticatedSessionController::logout
* @see vendor/laravel/fortify/src/Http/Controllers/AuthenticatedSessionController.php:100
* @route '/logout'
*/
logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: logout.url(options),
    method: 'post',
})

logout.form = logoutForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
export const home = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

home.definition = {
    methods: ["get","head"],
    url: '/',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.url = (options?: RouteQueryOptions) => {
    return home.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
home.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: home.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
const homeForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
homeForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/'
*/
homeForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: home.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

home.form = homeForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/dashboard'
*/
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/dashboard'
*/
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/dashboard'
*/
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/dashboard'
*/
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/dashboard'
*/
const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/dashboard'
*/
dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/dashboard'
*/
dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: dashboard.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

dashboard.form = dashboardForm

/**
* @see \App\Http\Controllers\UserController::userManager
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
export const userManager = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userManager.url(options),
    method: 'get',
})

userManager.definition = {
    methods: ["get","head"],
    url: '/user-manager',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserController::userManager
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
userManager.url = (options?: RouteQueryOptions) => {
    return userManager.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::userManager
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
userManager.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: userManager.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserController::userManager
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
userManager.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: userManager.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserController::userManager
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
const userManagerForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: userManager.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserController::userManager
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
userManagerForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: userManager.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserController::userManager
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
userManagerForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: userManager.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

userManager.form = userManagerForm

/**
* @see \App\Http\Controllers\PatenRegistrationController::patenRegistration
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
export const patenRegistration = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: patenRegistration.url(options),
    method: 'get',
})

patenRegistration.definition = {
    methods: ["get","head"],
    url: '/paten-registration',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatenRegistrationController::patenRegistration
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
patenRegistration.url = (options?: RouteQueryOptions) => {
    return patenRegistration.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatenRegistrationController::patenRegistration
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
patenRegistration.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: patenRegistration.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::patenRegistration
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
patenRegistration.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: patenRegistration.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::patenRegistration
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
const patenRegistrationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: patenRegistration.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::patenRegistration
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
patenRegistrationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: patenRegistration.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::patenRegistration
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
patenRegistrationForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: patenRegistration.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

patenRegistration.form = patenRegistrationForm
