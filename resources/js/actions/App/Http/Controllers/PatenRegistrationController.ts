import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PatenRegistrationController::index
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/paten-registration',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatenRegistrationController::index
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatenRegistrationController::index
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::index
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::index
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::index
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::index
* @see app/Http/Controllers/PatenRegistrationController.php:13
* @route '/paten-registration'
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
* @see \App\Http\Controllers\PatenRegistrationController::editor
* @see app/Http/Controllers/PatenRegistrationController.php:18
* @route '/paten-registration/editor'
*/
export const editor = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editor.url(options),
    method: 'get',
})

editor.definition = {
    methods: ["get","head"],
    url: '/paten-registration/editor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatenRegistrationController::editor
* @see app/Http/Controllers/PatenRegistrationController.php:18
* @route '/paten-registration/editor'
*/
editor.url = (options?: RouteQueryOptions) => {
    return editor.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatenRegistrationController::editor
* @see app/Http/Controllers/PatenRegistrationController.php:18
* @route '/paten-registration/editor'
*/
editor.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editor.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::editor
* @see app/Http/Controllers/PatenRegistrationController.php:18
* @route '/paten-registration/editor'
*/
editor.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: editor.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::editor
* @see app/Http/Controllers/PatenRegistrationController.php:18
* @route '/paten-registration/editor'
*/
const editorForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: editor.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::editor
* @see app/Http/Controllers/PatenRegistrationController.php:18
* @route '/paten-registration/editor'
*/
editorForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: editor.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::editor
* @see app/Http/Controllers/PatenRegistrationController.php:18
* @route '/paten-registration/editor'
*/
editorForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: editor.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

editor.form = editorForm

/**
* @see \App\Http\Controllers\PatenRegistrationController::template
* @see app/Http/Controllers/PatenRegistrationController.php:38
* @route '/paten-registration/template'
*/
export const template = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: template.url(options),
    method: 'get',
})

template.definition = {
    methods: ["get","head"],
    url: '/paten-registration/template',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatenRegistrationController::template
* @see app/Http/Controllers/PatenRegistrationController.php:38
* @route '/paten-registration/template'
*/
template.url = (options?: RouteQueryOptions) => {
    return template.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatenRegistrationController::template
* @see app/Http/Controllers/PatenRegistrationController.php:38
* @route '/paten-registration/template'
*/
template.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: template.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::template
* @see app/Http/Controllers/PatenRegistrationController.php:38
* @route '/paten-registration/template'
*/
template.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: template.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::template
* @see app/Http/Controllers/PatenRegistrationController.php:38
* @route '/paten-registration/template'
*/
const templateForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: template.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::template
* @see app/Http/Controllers/PatenRegistrationController.php:38
* @route '/paten-registration/template'
*/
templateForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: template.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::template
* @see app/Http/Controllers/PatenRegistrationController.php:38
* @route '/paten-registration/template'
*/
templateForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: template.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

template.form = templateForm

/**
* @see \App\Http\Controllers\PatenRegistrationController::templateSnapshot
* @see app/Http/Controllers/PatenRegistrationController.php:58
* @route '/paten-registration/template-snapshot'
*/
export const templateSnapshot = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templateSnapshot.url(options),
    method: 'get',
})

templateSnapshot.definition = {
    methods: ["get","head"],
    url: '/paten-registration/template-snapshot',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PatenRegistrationController::templateSnapshot
* @see app/Http/Controllers/PatenRegistrationController.php:58
* @route '/paten-registration/template-snapshot'
*/
templateSnapshot.url = (options?: RouteQueryOptions) => {
    return templateSnapshot.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatenRegistrationController::templateSnapshot
* @see app/Http/Controllers/PatenRegistrationController.php:58
* @route '/paten-registration/template-snapshot'
*/
templateSnapshot.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templateSnapshot.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::templateSnapshot
* @see app/Http/Controllers/PatenRegistrationController.php:58
* @route '/paten-registration/template-snapshot'
*/
templateSnapshot.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: templateSnapshot.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::templateSnapshot
* @see app/Http/Controllers/PatenRegistrationController.php:58
* @route '/paten-registration/template-snapshot'
*/
const templateSnapshotForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: templateSnapshot.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::templateSnapshot
* @see app/Http/Controllers/PatenRegistrationController.php:58
* @route '/paten-registration/template-snapshot'
*/
templateSnapshotForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: templateSnapshot.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::templateSnapshot
* @see app/Http/Controllers/PatenRegistrationController.php:58
* @route '/paten-registration/template-snapshot'
*/
templateSnapshotForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: templateSnapshot.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

templateSnapshot.form = templateSnapshotForm

/**
* @see \App\Http\Controllers\PatenRegistrationController::store
* @see app/Http/Controllers/PatenRegistrationController.php:76
* @route '/paten-registration'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/paten-registration',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PatenRegistrationController::store
* @see app/Http/Controllers/PatenRegistrationController.php:76
* @route '/paten-registration'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PatenRegistrationController::store
* @see app/Http/Controllers/PatenRegistrationController.php:76
* @route '/paten-registration'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::store
* @see app/Http/Controllers/PatenRegistrationController.php:76
* @route '/paten-registration'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\PatenRegistrationController::store
* @see app/Http/Controllers/PatenRegistrationController.php:76
* @route '/paten-registration'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const PatenRegistrationController = { index, editor, template, templateSnapshot, store }

export default PatenRegistrationController