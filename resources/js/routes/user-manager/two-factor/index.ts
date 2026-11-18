import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\UserController::enable
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
export const enable = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enable.url(args, options),
    method: 'post',
})

enable.definition = {
    methods: ["post"],
    url: '/user-manager/{user}/two-factor',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserController::enable
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
enable.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return enable.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::enable
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
enable.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enable.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::enable
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
const enableForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enable.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::enable
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
enableForm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enable.url(args, options),
    method: 'post',
})

enable.form = enableForm

/**
* @see \App\Http\Controllers\UserController::confirm
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
export const confirm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(args, options),
    method: 'post',
})

confirm.definition = {
    methods: ["post"],
    url: '/user-manager/{user}/two-factor/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserController::confirm
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
confirm.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return confirm.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::confirm
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
confirm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirm.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::confirm
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
const confirmForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::confirm
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
confirmForm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirm.url(args, options),
    method: 'post',
})

confirm.form = confirmForm

/**
* @see \App\Http\Controllers\UserController::disable
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
export const disable = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disable.url(args, options),
    method: 'delete',
})

disable.definition = {
    methods: ["delete"],
    url: '/user-manager/{user}/two-factor',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\UserController::disable
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
disable.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { user: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { user: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            user: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        user: typeof args.user === 'object'
        ? args.user.id
        : args.user,
    }

    return disable.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::disable
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
disable.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disable.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\UserController::disable
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
const disableForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disable.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::disable
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
disableForm.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disable.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

disable.form = disableForm

const twoFactor = {
    enable: Object.assign(enable, enable),
    confirm: Object.assign(confirm, confirm),
    disable: Object.assign(disable, disable),
}

export default twoFactor