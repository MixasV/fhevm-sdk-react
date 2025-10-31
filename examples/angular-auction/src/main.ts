import { bootstrapApplication } from '@angular/platform-browser'
import { importProvidersFrom } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { FHEVMService } from '@mixaspro/angular'

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    FHEVMService
  ]
}).catch(err => console.error(err))
