import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
import templateSettings22d0a6 from './template-settings'
/**
* @see \App\Http\Controllers\MarriageDispensationController::editor
* @see app/Http/Controllers/MarriageDispensationController.php:189
* @route '/marriage-dispensation/editor'
*/
export const editor = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editor.url(options),
    method: 'get',
})

editor.definition = {
    methods: ["get","head"],
    url: '/marriage-dispensation/editor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MarriageDispensationController::editor
* @see app/Http/Controllers/MarriageDispensationController.php:189
* @route '/marriage-dispensation/editor'
*/
editor.url = (options?: RouteQueryOptions) => {
    return editor.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarriageDispensationController::editor
* @see app/Http/Controllers/MarriageDispensationController.php:189
* @route '/marriage-dispensation/editor'
*/
editor.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: editor.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::editor
* @see app/Http/Controllers/MarriageDispensationController.php:189
* @route '/marriage-dispensation/editor'
*/
editor.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: editor.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::editor
* @see app/Http/Controllers/MarriageDispensationController.php:189
* @route '/marriage-dispensation/editor'
*/
const editorForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: editor.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::editor
* @see app/Http/Controllers/MarriageDispensationController.php:189
* @route '/marriage-dispensation/editor'
*/
editorForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: editor.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::editor
* @see app/Http/Controllers/MarriageDispensationController.php:189
* @route '/marriage-dispensation/editor'
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
* @see \App\Http\Controllers\MarriageDispensationController::loadToEditor
* @see app/Http/Controllers/MarriageDispensationController.php:198
* @route '/marriage-dispensation/{marriageDispensation}/editor'
*/
export const loadToEditor = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loadToEditor.url(args, options),
    method: 'get',
})

loadToEditor.definition = {
    methods: ["get","head"],
    url: '/marriage-dispensation/{marriageDispensation}/editor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MarriageDispensationController::loadToEditor
* @see app/Http/Controllers/MarriageDispensationController.php:198
* @route '/marriage-dispensation/{marriageDispensation}/editor'
*/
loadToEditor.url = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { marriageDispensation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { marriageDispensation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            marriageDispensation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        marriageDispensation: typeof args.marriageDispensation === 'object'
        ? args.marriageDispensation.id
        : args.marriageDispensation,
    }

    return loadToEditor.definition.url
            .replace('{marriageDispensation}', parsedArgs.marriageDispensation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarriageDispensationController::loadToEditor
* @see app/Http/Controllers/MarriageDispensationController.php:198
* @route '/marriage-dispensation/{marriageDispensation}/editor'
*/
loadToEditor.get = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: loadToEditor.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::loadToEditor
* @see app/Http/Controllers/MarriageDispensationController.php:198
* @route '/marriage-dispensation/{marriageDispensation}/editor'
*/
loadToEditor.head = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: loadToEditor.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::loadToEditor
* @see app/Http/Controllers/MarriageDispensationController.php:198
* @route '/marriage-dispensation/{marriageDispensation}/editor'
*/
const loadToEditorForm = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: loadToEditor.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::loadToEditor
* @see app/Http/Controllers/MarriageDispensationController.php:198
* @route '/marriage-dispensation/{marriageDispensation}/editor'
*/
loadToEditorForm.get = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: loadToEditor.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::loadToEditor
* @see app/Http/Controllers/MarriageDispensationController.php:198
* @route '/marriage-dispensation/{marriageDispensation}/editor'
*/
loadToEditorForm.head = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: loadToEditor.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

loadToEditor.form = loadToEditorForm

/**
* @see \App\Http\Controllers\MarriageDispensationController::history
* @see app/Http/Controllers/MarriageDispensationController.php:45
* @route '/marriage-dispensation/history'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/marriage-dispensation/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MarriageDispensationController::history
* @see app/Http/Controllers/MarriageDispensationController.php:45
* @route '/marriage-dispensation/history'
*/
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarriageDispensationController::history
* @see app/Http/Controllers/MarriageDispensationController.php:45
* @route '/marriage-dispensation/history'
*/
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::history
* @see app/Http/Controllers/MarriageDispensationController.php:45
* @route '/marriage-dispensation/history'
*/
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::history
* @see app/Http/Controllers/MarriageDispensationController.php:45
* @route '/marriage-dispensation/history'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::history
* @see app/Http/Controllers/MarriageDispensationController.php:45
* @route '/marriage-dispensation/history'
*/
historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::history
* @see app/Http/Controllers/MarriageDispensationController.php:45
* @route '/marriage-dispensation/history'
*/
historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

history.form = historyForm

/**
* @see \App\Http\Controllers\MarriageDispensationController::exportMethod
* @see app/Http/Controllers/MarriageDispensationController.php:58
* @route '/marriage-dispensation/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/marriage-dispensation/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MarriageDispensationController::exportMethod
* @see app/Http/Controllers/MarriageDispensationController.php:58
* @route '/marriage-dispensation/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarriageDispensationController::exportMethod
* @see app/Http/Controllers/MarriageDispensationController.php:58
* @route '/marriage-dispensation/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::exportMethod
* @see app/Http/Controllers/MarriageDispensationController.php:58
* @route '/marriage-dispensation/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::exportMethod
* @see app/Http/Controllers/MarriageDispensationController.php:58
* @route '/marriage-dispensation/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::exportMethod
* @see app/Http/Controllers/MarriageDispensationController.php:58
* @route '/marriage-dispensation/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::exportMethod
* @see app/Http/Controllers/MarriageDispensationController.php:58
* @route '/marriage-dispensation/export'
*/
exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

exportMethod.form = exportMethodForm

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/marriage-dispensation/village-data'
*/
export const villageData = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: villageData.url(options),
    method: 'get',
})

villageData.definition = {
    methods: ["get","head"],
    url: '/marriage-dispensation/village-data',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/marriage-dispensation/village-data'
*/
villageData.url = (options?: RouteQueryOptions) => {
    return villageData.definition.url + queryParams(options)
}

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/marriage-dispensation/village-data'
*/
villageData.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: villageData.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/marriage-dispensation/village-data'
*/
villageData.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: villageData.url(options),
    method: 'head',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/marriage-dispensation/village-data'
*/
const villageDataForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: villageData.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/marriage-dispensation/village-data'
*/
villageDataForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: villageData.url(options),
    method: 'get',
})

/**
* @see \Inertia\Controller::__invoke
* @see vendor/inertiajs/inertia-laravel/src/Controller.php:13
* @route '/marriage-dispensation/village-data'
*/
villageDataForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: villageData.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

villageData.form = villageDataForm

/**
* @see \App\Http\Controllers\TemplateSettingController::templateSettings
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
export const templateSettings = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templateSettings.url(options),
    method: 'get',
})

templateSettings.definition = {
    methods: ["get","head"],
    url: '/marriage-dispensation/template-settings',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TemplateSettingController::templateSettings
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
templateSettings.url = (options?: RouteQueryOptions) => {
    return templateSettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TemplateSettingController::templateSettings
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
templateSettings.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templateSettings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::templateSettings
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
templateSettings.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: templateSettings.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::templateSettings
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
const templateSettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: templateSettings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::templateSettings
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
templateSettingsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: templateSettings.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\TemplateSettingController::templateSettings
* @see app/Http/Controllers/TemplateSettingController.php:39
* @route '/marriage-dispensation/template-settings'
*/
templateSettingsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: templateSettings.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

templateSettings.form = templateSettingsForm

/**
* @see \App\Http\Controllers\MarriageDispensationController::store
* @see app/Http/Controllers/MarriageDispensationController.php:208
* @route '/marriage-dispensation'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/marriage-dispensation',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MarriageDispensationController::store
* @see app/Http/Controllers/MarriageDispensationController.php:208
* @route '/marriage-dispensation'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarriageDispensationController::store
* @see app/Http/Controllers/MarriageDispensationController.php:208
* @route '/marriage-dispensation'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::store
* @see app/Http/Controllers/MarriageDispensationController.php:208
* @route '/marriage-dispensation'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::store
* @see app/Http/Controllers/MarriageDispensationController.php:208
* @route '/marriage-dispensation'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\MarriageDispensationController::destroy
* @see app/Http/Controllers/MarriageDispensationController.php:248
* @route '/marriage-dispensation/{marriageDispensation}'
*/
export const destroy = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/marriage-dispensation/{marriageDispensation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MarriageDispensationController::destroy
* @see app/Http/Controllers/MarriageDispensationController.php:248
* @route '/marriage-dispensation/{marriageDispensation}'
*/
destroy.url = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { marriageDispensation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { marriageDispensation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            marriageDispensation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        marriageDispensation: typeof args.marriageDispensation === 'object'
        ? args.marriageDispensation.id
        : args.marriageDispensation,
    }

    return destroy.definition.url
            .replace('{marriageDispensation}', parsedArgs.marriageDispensation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarriageDispensationController::destroy
* @see app/Http/Controllers/MarriageDispensationController.php:248
* @route '/marriage-dispensation/{marriageDispensation}'
*/
destroy.delete = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::destroy
* @see app/Http/Controllers/MarriageDispensationController.php:248
* @route '/marriage-dispensation/{marriageDispensation}'
*/
const destroyForm = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MarriageDispensationController::destroy
* @see app/Http/Controllers/MarriageDispensationController.php:248
* @route '/marriage-dispensation/{marriageDispensation}'
*/
destroyForm.delete = (args: { marriageDispensation: number | { id: number } } | [marriageDispensation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const marriageDispensation = {
    editor: Object.assign(editor, editor),
    loadToEditor: Object.assign(loadToEditor, loadToEditor),
    history: Object.assign(history, history),
    export: Object.assign(exportMethod, exportMethod),
    villageData: Object.assign(villageData, villageData),
    templateSettings: Object.assign(templateSettings, templateSettings22d0a6),
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default marriageDispensation