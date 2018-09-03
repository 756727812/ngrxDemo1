import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { BindComponent } from './bind/bind.component';
import { ForgetComponent } from './forget/forget.component';

import { forgetComponents } from './forget/components';
import { bindComponents } from './bind/components';
import { registerComponents } from './register/components';

export const authContainer = [
  LoginComponent,
  RegisterComponent,
  BindComponent,
  ForgetComponent,
  ...forgetComponents,
  ...bindComponents,
  ...registerComponents,
];

export default {
  LoginComponent,
  RegisterComponent,
  BindComponent,
  ForgetComponent,
};
