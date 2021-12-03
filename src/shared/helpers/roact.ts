import Roact from "@rbxts/roact";
import {Players} from "@rbxts/services";

import {isDebug} from "./attribute";
import {CleanupFuncType} from "./clean";

/***
 * Copied from Roact type definitions
 */

type MapBindings<T> = {[K in keyof T]: T[K] | Roact.Binding<T[K]>};
type HostComponentProps<T extends Roact.HostComponent> = Partial<
  WritableInstanceProperties<CreatableInstances[T]>
> & {
  [Roact.Ref]?: Roact.Ref<CreatableInstances[T]> | ((ref: CreatableInstances[T]) => void);
};

/**
 * Mount specified GUI and return unmount function
 *
 * ```typescript
 * const unmountGui = mountRoactGui("TestUI", createRoactScreenGui(TestDialog, params));
 * game.BindToClose(unmountGui);
 * ```
 */
export function mountRoactGui(
  name: string,
  gui: Roact.Element,
  parent?: Instance
): CleanupFuncType {
  if (isDebug) print("GUI", name, "MOUNT");
  const handle = Roact.mount(
    gui,
    parent ? parent : Players.LocalPlayer.WaitForChild("PlayerGui"),
    name
  );
  return () => {
    if (handle) {
      if (isDebug) print("GUI", name, "UNMOUNT");
      return Roact.unmount(handle);
    }
  };
}

/**
 * Mount specified Instance and return unmount function
 *
 * ```typescript
 * const unmount = mountRoactInstance("TestModel", createRoactInstance(Model, params));
 * game.BindToClose(unmount);
 * ```
 */
export function mountRoactInstance(
  name: string,
  element: Roact.Element,
  parent?: Instance
): CleanupFuncType {
  if (isDebug) print("INSTANCE", name, "MOUNT");
  const handle = Roact.mount(
    element,
    parent ? parent : Players.LocalPlayer.WaitForChild("PlayerGui"),
    name
  );
  return () => {
    if (handle) {
      if (isDebug) print("INSTANCE", name, "UNMOUNT");
      return Roact.unmount(handle);
    }
  };
}

/**
 * Create screen GUI using specified component and props
 *
 * ```typescript
 * const unmountGui = mountRoactGui("TrainControlUI", createRoactScreenGui(TrainControlDialog, {train}));
 * game.BindToClose(unmountGui);
 * ```
 */
export function createRoactScreenGui<P>(
  component: Roact.FunctionComponent<P>,
  props?: MapBindings<P>,
  options?: MapBindings<HostComponentProps<"ScreenGui">> | undefined
): Roact.Element;
export function createRoactScreenGui<P>(
  component: Roact.ComponentConstructor<P>,
  props?: MapBindings<P>,
  options?: MapBindings<HostComponentProps<"ScreenGui">> | undefined
): Roact.Element;
export function createRoactScreenGui<C extends Roact.HostComponent>(
  component: C,
  props?: MapBindings<HostComponentProps<C>>,
  options?: MapBindings<HostComponentProps<"ScreenGui">> | undefined
): Roact.Element {
  return Roact.createElement("ScreenGui", options, [Roact.createElement(component, props)]);
}

/**
 * Create surface GUI using specified component, props and options
 *
 * ```typescript
 * const unmountGui = mountRoactGui("RouteUI", createRoactSurfaceGui(RouteDialog, params, {Adornee: instance}))
 * game.BindToClose(unmountGui);
 * ```
 */
export function createRoactSurfaceGui<P>(
  component: Roact.FunctionComponent<P>,
  props?: MapBindings<P>,
  options?: MapBindings<HostComponentProps<"SurfaceGui">> | undefined
): Roact.Element;
export function createRoactSurfaceGui<P>(
  component: Roact.ComponentConstructor<P>,
  props?: MapBindings<P>,
  options?: MapBindings<HostComponentProps<"SurfaceGui">> | undefined
): Roact.Element;
export function createRoactSurfaceGui<C extends Roact.HostComponent>(
  component: C,
  props?: MapBindings<HostComponentProps<C>>,
  options?: MapBindings<HostComponentProps<"SurfaceGui">> | undefined
) {
  return Roact.createElement("SurfaceGui", options, [Roact.createElement(component, props)]);
}

/**
 * Create billboard GUI using specified component, props and options
 *
 * ```typescript
 * const unmountGui = mountRoactGui("DespawnCounterUI", createRoactBillboardGui(DespawnCounterDisplay, params, {Adornee: instance}));
 * game.BindToClose(unmountGui);
 * ```
 */
export function createRoactBillboardGui<P>(
  component: Roact.FunctionComponent<P>,
  props?: MapBindings<P>,
  options?: MapBindings<HostComponentProps<"BillboardGui">> | undefined
): Roact.Element;
export function createRoactBillboardGui<P>(
  component: Roact.ComponentConstructor<P>,
  props?: MapBindings<P>,
  options?: MapBindings<HostComponentProps<"BillboardGui">> | undefined
): Roact.Element;
export function createRoactBillboardGui<C extends Roact.HostComponent>(
  component: C,
  props?: MapBindings<HostComponentProps<C>>,
  options?: MapBindings<HostComponentProps<"BillboardGui">> | undefined
) {
  return Roact.createElement("BillboardGui", options, [Roact.createElement(component, props)]);
}

/**
 * Create instance using specified component and props
 *
 * ```typescript
 * const unmount = mountRoactInstance("TestModel", createRoactInstance(Model, params));
 * game.BindToClose(unmount);
 * ```
 */
export function createRoactInstance<P>(
  component: Roact.FunctionComponent<P>,
  props?: MapBindings<P>
): Roact.Element;
export function createRoactInstance<P>(
  component: Roact.ComponentConstructor<P>,
  props?: MapBindings<P>
): Roact.Element;
export function createRoactInstance<C extends Roact.HostComponent>(
  component: C,
  props?: MapBindings<HostComponentProps<C>>
) {
  return Roact.createElement(component, props);
}
