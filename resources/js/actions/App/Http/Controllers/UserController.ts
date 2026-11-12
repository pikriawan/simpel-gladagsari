import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\UserController::index
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/user-manager',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\UserController::index
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::index
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserController::index
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\UserController::index
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserController::index
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\UserController::index
* @see app/Http/Controllers/UserController.php:22
* @route '/user-manager'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\UserController::store
* @see app/Http/Controllers/UserController.php:34
* @route '/user-manager'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/user-manager',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserController::store
* @see app/Http/Controllers/UserController.php:34
* @route '/user-manager'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::store
* @see app/Http/Controllers/UserController.php:34
* @route '/user-manager'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::store
* @see app/Http/Controllers/UserController.php:34
* @route '/user-manager'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::store
* @see app/Http/Controllers/UserController.php:34
* @route '/user-manager'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\UserController::update
* @see app/Http/Controllers/UserController.php:72
* @route '/user-manager/{user}'
*/
export const update = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/user-manager/{user}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\UserController::update
* @see app/Http/Controllers/UserController.php:72
* @route '/user-manager/{user}'
*/
update.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return update.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::update
* @see app/Http/Controllers/UserController.php:72
* @route '/user-manager/{user}'
*/
update.put = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\UserController::update
* @see app/Http/Controllers/UserController.php:72
* @route '/user-manager/{user}'
*/
const updateForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::update
* @see app/Http/Controllers/UserController.php:72
* @route '/user-manager/{user}'
*/
updateForm.put = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\UserController::destroy
* @see app/Http/Controllers/UserController.php:150
* @route '/user-manager/{user}'
*/
export const destroy = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/user-manager/{user}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\UserController::destroy
* @see app/Http/Controllers/UserController.php:150
* @route '/user-manager/{user}'
*/
destroy.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::destroy
* @see app/Http/Controllers/UserController.php:150
* @route '/user-manager/{user}'
*/
destroy.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\UserController::destroy
* @see app/Http/Controllers/UserController.php:150
* @route '/user-manager/{user}'
*/
const destroyForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::destroy
* @see app/Http/Controllers/UserController.php:150
* @route '/user-manager/{user}'
*/
destroyForm.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\UserController::enableTwoFactor
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
export const enableTwoFactor = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enableTwoFactor.url(args, options),
    method: 'post',
})

enableTwoFactor.definition = {
    methods: ["post"],
    url: '/user-manager/{user}/two-factor',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserController::enableTwoFactor
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
enableTwoFactor.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return enableTwoFactor.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::enableTwoFactor
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
enableTwoFactor.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enableTwoFactor.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::enableTwoFactor
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
const enableTwoFactorForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enableTwoFactor.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::enableTwoFactor
* @see app/Http/Controllers/UserController.php:100
* @route '/user-manager/{user}/two-factor'
*/
enableTwoFactorForm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: enableTwoFactor.url(args, options),
    method: 'post',
})

enableTwoFactor.form = enableTwoFactorForm

/**
* @see \App\Http\Controllers\UserController::confirmTwoFactor
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
export const confirmTwoFactor = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmTwoFactor.url(args, options),
    method: 'post',
})

confirmTwoFactor.definition = {
    methods: ["post"],
    url: '/user-manager/{user}/two-factor/confirm',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\UserController::confirmTwoFactor
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
confirmTwoFactor.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return confirmTwoFactor.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::confirmTwoFactor
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
confirmTwoFactor.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: confirmTwoFactor.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::confirmTwoFactor
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
const confirmTwoFactorForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmTwoFactor.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::confirmTwoFactor
* @see app/Http/Controllers/UserController.php:118
* @route '/user-manager/{user}/two-factor/confirm'
*/
confirmTwoFactorForm.post = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: confirmTwoFactor.url(args, options),
    method: 'post',
})

confirmTwoFactor.form = confirmTwoFactorForm

/**
* @see \App\Http\Controllers\UserController::disableTwoFactor
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
export const disableTwoFactor = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disableTwoFactor.url(args, options),
    method: 'delete',
})

disableTwoFactor.definition = {
    methods: ["delete"],
    url: '/user-manager/{user}/two-factor',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\UserController::disableTwoFactor
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
disableTwoFactor.url = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return disableTwoFactor.definition.url
            .replace('{user}', parsedArgs.user.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\UserController::disableTwoFactor
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
disableTwoFactor.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: disableTwoFactor.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\UserController::disableTwoFactor
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
const disableTwoFactorForm = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disableTwoFactor.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\UserController::disableTwoFactor
* @see app/Http/Controllers/UserController.php:138
* @route '/user-manager/{user}/two-factor'
*/
disableTwoFactorForm.delete = (args: { user: number | { id: number } } | [user: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disableTwoFactor.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

disableTwoFactor.form = disableTwoFactorForm

const UserController = { index, store, update, destroy, enableTwoFactor, confirmTwoFactor, disableTwoFactor }

export default UserController