import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SelectOptionsComponent } from './select-options/select-options.component';
import { OrderComponent } from './order/order.component';
import { VerifyComponent } from './verify/verify.component';
import { ListResultComponent } from './list-result/list-result.component';
import { LoginComponent } from './login/login.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './shared/_guards/auth.guard';
import { ResetComponent } from './reset/reset.component';
import { VoucherComponent } from './voucher/voucher.component';
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'list-result/:desId/:catId/:subId/:keyword', component: ListResultComponent },
  { path: 'list-result/:desId/:catId/:subId', component: ListResultComponent },
  { path: 'detail/:code', component: ProductDetailComponent },
  { path: 'detail/:desId/:code/:keyword', component: ProductDetailComponent },
  { path: 'select-options/:code', component: SelectOptionsComponent },
  { path: 'order', component: OrderComponent },
  { path: 'login', component: LoginComponent },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'voucher/:voucherKey', component: VoucherComponent },
  { path: 'verify/:email/:verifyCode', component: VerifyComponent },
  { path: 'reset-password', component: ResetComponent },
  // otherwise redirect to 404
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
