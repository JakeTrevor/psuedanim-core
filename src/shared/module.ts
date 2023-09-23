import {
  createDefaultModule,
  createDefaultSharedModule,
  DefaultSharedModuleContext,
  inject,
  LangiumServices,
  LangiumSharedServices,
  Module,
  PartialLangiumServices,
} from "langium";
import { PseudanimValidator, registerValidationChecks } from "./validator.js";
import {
  PseudanimGeneratedModule,
  PseudanimGeneratedSharedModule,
} from "../generated/module.js";

/**
 * Declaration of custom services - add your own service classes here.
 */
export type PseudanimAddedServices = {
  validation: {
    PseudanimValidator: PseudanimValidator;
  };
};

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type PseudanimServices = LangiumServices & PseudanimAddedServices;

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const PseudanimModule: Module<
  PseudanimServices,
  PartialLangiumServices & PseudanimAddedServices
> = {
  validation: {
    PseudanimValidator: () => new PseudanimValidator(),
  },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createPseudanimServices(context: DefaultSharedModuleContext): {
  shared: LangiumSharedServices;
  Pseudanim: PseudanimServices;
} {
  const shared = inject(
    createDefaultSharedModule(context),
    PseudanimGeneratedSharedModule
  );
  const Pseudanim = inject(
    createDefaultModule({ shared }),
    PseudanimGeneratedModule,
    PseudanimModule
  );
  shared.ServiceRegistry.register(Pseudanim);
  registerValidationChecks(Pseudanim);
  return { shared, Pseudanim };
}
