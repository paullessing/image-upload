import {Container, injectable, decorate, interfaces, ContainerModule} from 'inversify';

import {FileScanner} from './file-scanner';

/*
 README

 Inversify's syntax is nice, but it requires an inversify.config.ts file with explicit bindings.
 We would rather have bindings resolve automagically; this file provides the implementation for this.

 We use Typescript Decorators for this. These decorators all work the same way: When they are run, they add the class
 on which they are declared to an internal list of such classes. We differentiate between classes (simple injection),
 providers (need to inject both the provider and its result), and bindings (which are run but not injected themselves.)
 When getDependencyContainer() is called, this list is evaluated and used to build an Inversify Container containing all
 the bindings gathered from the decorators, by adding each decorator's definitions to a single Container object.

 First, we have to do a little dirty hack: File Scanning.
 Because node.js only runs decorators on classes as they are loaded, and this loading only happens when the file is
 required(), we have a problem. Any classes that are not required() from the main app file will never be loaded, so their
 decorators will not be run - which will result in them not being in the container.
 Therefore, we have to run the FileScanner, and require() every file in the project, to ensure that e.g. Providers() that
 are never explicitly called are still evaluated.

 Next, we build the container. Each of the decorators adds to one of three lists: classes, providers, and bindings.
 We then iterate over these lists.
 The classes are simple: They are simply added as a bind(classFunction).toSelf().
 The providers are slightly more complex, since we have to first add the provider itself, then evaluate it;
 bind(SYMBOL).toDynamicValue() allows us to evaluate a provider lazily after all other dependencies have resolved, and
 use its $provide() value.
 Finally, bindings are evaluated once, creating a ContainerModule, allowing the Bindings class to add its own bindings,
 and then loading the ContainerModule into the global scope.
 */

/**
 * Determines whether an injectable class is a singleton (single instance globally) or transient (fresh instance per injection).
 */
export enum Scope {
  SINGLETON,
  TRANSIENT
}

/**
 * Used for binding @Service and @Component decorators.
 */
interface ClassDefinition {
  classConstructor: Function;
  scope: Scope;
}

/**
 * Used for binding @Provider decorators.
 */
interface ProviderDefinition {
  providerConstructor: Function;
  symbol: symbol;
}

interface Provider {
  $provide: () => any;
}

type BindFunction = (bind: interfaces.Bind) => void;

/**
 * Used for binding @Bindings decorators.
 */
interface BindingsDefinition {
  bindFunction: BindFunction;
}

interface BindingsProvider {
  $bind: BindFunction;
}

// These arrays contain all the discovered bindings.
const classes: ClassDefinition[] = [];
const providers: ProviderDefinition[] = [];
const bindings: BindingsDefinition[] = [];

/**
 * Decorator for services. Services are injectable classes that are by default singletons, such as services and API implementations,
 * and may contain other services and components.
 *
 * Use it by adding @Service() to a class to ensure it is added to the global inversify scope.
 * @param scope Optional scope, defaults to Singleton.
 */
export function Service(scope: Scope = Scope.SINGLETON): ClassDecorator {
  return function(classConstructor: Function): void {
    decorate(injectable(), classConstructor);
    classes.push({
      classConstructor,
      scope
    });
  };
}

/**
 * Decorator for components. Components are injectable classes such as helpers that don't need to be singletons.
 *
 * Use it by adding @Component() to a class to ensure it is added to the global inversify scope.
 * @param scope Optional scope, defaults to Singleton.
 */
export function Component(scope: Scope = Scope.TRANSIENT): ClassDecorator {
  return Service(scope);
}

/**
 * Decorator for a kind of factory class. The Provider is considered a service, and must contain a $provide() method
 * with no arguments.
 *
 * The $provide() method will be called at startup to bind the given identifier to the result of the call.
 * This allows creating singleton classes where the factory needs to have dependencies injected into it.
 *
 * Example:
 * <code><pre>
 *   @Provider(TYPES.logger)
 *   public class LoggerProvider {
 *     constructor(@inject(CONFIG_TYPES.config) private config: config) {}
 *     public $provide(): Logger {
 *       if (this.config.isLoggingEnabled) {
 *         return new ConsoleLogger();
 *       } else {
 *         return new SilentLogger();
 *       }
 *     }
 *   }
 *   // @inject(TYPES.logger) now injects either a ConsoleLogger or a SilentLogger depending on startup config.
 * </pre></code>
 *
 * @param identifier Symbol to which the result of the $provide() method will be bound.
 */
export function Provider(identifier: symbol): ClassDecorator {
  return function(providerConstructor: Function): void {
    if (!providerConstructor.prototype.hasOwnProperty('$provide')) {
      throw new Error('Provider ' + providerConstructor.name + ' does not have a $provide() method');
    }
    if (providerConstructor.prototype.$provide.length > 0) {
      throw new Error('Cannot use provider: ' + providerConstructor.name + '.$provide() must be a zero-argument function');
    }
    decorate(injectable(), providerConstructor);
    classes.push({
      classConstructor: providerConstructor,
      scope: Scope.SINGLETON
    });
    providers.push({
      providerConstructor,
      symbol: identifier
    });
  };
}

/**
 * Decorator for adding bindings. This should be used for adding constants.
 * The class decorated with this decorator must have a static $bind() method implementing the BindFunction interface.
 *
 * Example use:
 * <code><pre>
 *   @Bindings()
 *   public ConfigModule {
 *     public static $bind(bind: interfaces.Bind): void {
 *       bind(CONFIG.config).toConstantValue(config);
 *       bind(CONFIG.buildVersion).toConstantValue(17);
 *     }
 *   }
 * </pre></code>
 */
export function Bindings(): ClassDecorator {
  return function(bindingsClass: Function & BindingsProvider): void {
    if (!bindingsClass.hasOwnProperty('$bind')) {
      throw new Error('Provider ' + bindingsClass.name + ' does not have a $bind() method');
    }
    if (bindingsClass.$bind.length !== 1) {
      throw new Error('Cannot use container module provider: ' + bindingsClass.name + '.$bind() must be a single-argument function');
    }
    bindings.push({
      bindFunction: bindingsClass.$bind
    });
  } as ClassDecorator;
}

/**
 * Creates an Inversify Container from all the files annotated with the decorators in this module.
 */
export function createDependencyContainer(directory: string): Container {
  // Black magic happens here.
  // We scan all the files in the given directory to ensure that all classes with decorators have been processed,
  // even if nobody is referencing them directly. This allows us to have files that provide other classes.
  new FileScanner(directory).scan();

  const container = new Container();

  classes.forEach((classDefn: ClassDefinition) => {
    const binding = container.bind(classDefn.classConstructor).toSelf();
    bindToScope(binding, classDefn.scope);
  });

  providers.forEach((providerDefn: ProviderDefinition) => {
    const binding = container.bind(providerDefn.symbol).toDynamicValue((context: interfaces.Context) => {
      const provider: Provider = context.container.get(providerDefn.providerConstructor);
      return provider.$provide();
    });
    bindToScope(binding, Scope.SINGLETON);
  });

  bindings.forEach((bindingsDefn: BindingsDefinition) => {
    const module = new ContainerModule(bindingsDefn.bindFunction);
    container.load(module);
  });

  return container;
}

export class Dependencies {
  public static container: Container;

  public static createContainer(directory: string): Container {
    Dependencies.container = createDependencyContainer(directory);
    return Dependencies.container;
  }
}

function bindToScope(binding: interfaces.BindingInWhenOnSyntax<any>, scope: Scope): void {
  switch (scope) {
    case Scope.TRANSIENT:
      binding.inTransientScope();
      break;
    case Scope.SINGLETON:
      binding.inSingletonScope();
      break;
    default:
      throw new Error('Scope ' + scope + ' is not a recognised value');
  }
}
