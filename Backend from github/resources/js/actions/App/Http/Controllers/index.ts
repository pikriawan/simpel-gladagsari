import UserController from './UserController'
import MarriageDispensationController from './MarriageDispensationController'
import TemplateSettingController from './TemplateSettingController'
import PatenRegistrationController from './PatenRegistrationController'
import Settings from './Settings'

const Controllers = {
    UserController: Object.assign(UserController, UserController),
    MarriageDispensationController: Object.assign(MarriageDispensationController, MarriageDispensationController),
    TemplateSettingController: Object.assign(TemplateSettingController, TemplateSettingController),
    PatenRegistrationController: Object.assign(PatenRegistrationController, PatenRegistrationController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers