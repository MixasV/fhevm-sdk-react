/**
 * FHEVM Angular module
 * 
 * @packageDocumentation
 */

import { NgModule, ModuleWithProviders } from '@angular/core'
import type { FHEVMConfig } from '@mixaspro/core'

import { FHEVMService } from './services/fhevm.service'

/**
 * FHEVM module configuration
 */
export interface FHEVMModuleConfig {
  /**
   * FHEVM configuration
   */
  config: FHEVMConfig

  /**
   * Auto-initialize on module load
   */
  autoInit?: boolean
}

/**
 * FHEVM Angular module
 * 
 * @example
 * ```typescript
 * import { NgModule } from '@angular/core'
 * import { FHEVMModule } from '@mixaspro/angular'
 * 
 * @NgModule({
 *   imports: [
 *     FHEVMModule.forRoot({
 *       config: { chainId: 31337 },
 *       autoInit: true
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
@NgModule({
  providers: [FHEVMService],
})
export class FHEVMModule {
  /**
   * Configure FHEVM module for root
   * 
   * @param config - Module configuration
   * @returns Module with providers
   */
  static forRoot(config?: FHEVMModuleConfig): ModuleWithProviders<FHEVMModule> {
    return {
      ngModule: FHEVMModule,
      providers: [
        FHEVMService,
        {
          provide: 'FHEVM_CONFIG',
          useValue: config,
        },
      ],
    }
  }
}
