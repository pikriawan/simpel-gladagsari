import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TemplateSettingController::index
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/marriage-dispensation/template-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TemplateSettingController::index
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TemplateSettingController::index
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::index
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::index
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::index
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::index
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
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
* @see \App\Http\Controllers\TemplateSettingController::store
* @see app/Http/Controllers/TemplateSettingController.php:46
* @route '/marriage-dispensation/template-settings'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/marriage-dispensation/template-settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TemplateSettingController::store
* @see app/Http/Controllers/TemplateSettingController.php:46
* @route '/marriage-dispensation/template-settings'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TemplateSettingController::store
* @see app/Http/Controllers/TemplateSettingController.php:46
* @route '/marriage-dispensation/template-settings'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::store
* @see app/Http/Controllers/TemplateSettingController.php:46
* @route '/marriage-dispensation/template-settings'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::store
* @see app/Http/Controllers/TemplateSettingController.php:46
* @route '/marriage-dispensation/template-settings'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\TemplateSettingController::reset
* @see app/Http/Controllers/TemplateSettingController.php:65
* @route '/marriage-dispensation/template-settings'
*/
export const reset = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reset.url(options),
    method: 'delete',
})

reset.definition = {
    methods: ["delete"],
    url: '/marriage-dispensation/template-settings',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\TemplateSettingController::reset
* @see app/Http/Controllers/TemplateSettingController.php:65
* @route '/marriage-dispensation/template-settings'
*/
reset.url = (options?: RouteQueryOptions) => {
    return reset.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TemplateSettingController::reset
* @see app/Http/Controllers/TemplateSettingController.php:65
* @route '/marriage-dispensation/template-settings'
*/
reset.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: reset.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::reset
* @see app/Http/Controllers/TemplateSettingController.php:65
* @route '/marriage-dispensation/template-settings'
*/
const resetForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reset.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::reset
* @see app/Http/Controllers/TemplateSettingController.php:65
* @route '/marriage-dispensation/template-settings'
*/
resetForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reset.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

reset.form = resetForm

const TemplateSettingController = { index, store, reset }

export default TemplateSettingController