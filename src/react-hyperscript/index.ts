import React from "react";

type Element = React.ReactElement | string | number | null | undefined;

type getPropType<T> = T extends React.DetailedHTMLFactory<infer TAttr, any> ? TAttr : "never"
type getElement<T> = T extends React.DetailedHTMLFactory<any, infer TResult> ? TResult : "never"
type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export function h(
    children: ReadonlyArray<Element> | Element
): React.ReactElement<HTMLElement>;

export function h<T extends keyof React.ReactHTML>(
    tag: "input",
    key: string,
    properties: React.InputHTMLAttributes<HTMLInputElement> & {key?: string},
    children: ReadonlyArray<Element>
): React.ReactElement<getElement<HTMLInputElement>>;

export function h<T extends keyof React.ReactHTML>(
    tag: "input",
    key: string,
    classes: Array<string | false | undefined | null>,
    properties: React.InputHTMLAttributes<HTMLInputElement> & {key?: string},
    children: ReadonlyArray<Element>
): React.ReactElement<getElement<HTMLInputElement>>;

export function h<T extends keyof React.ReactHTML>(
    tag: "input",
    key: string,
    classes: Array<string | false | undefined | null>,
    children: ReadonlyArray<Element>
): React.ReactElement<getElement<HTMLInputElement>>;

export function h<T extends keyof React.ReactHTML>(
    tag: "input",
    key: string,
    children: ReadonlyArray<Element>
): React.ReactElement<getElement<HTMLInputElement>>;

export function h<T extends keyof React.ReactHTML>(
    tag: T,
    key: string,
    classes: Array<string | false | undefined | null>,
    properties: getPropType<React.ReactHTML[T]> & {key?: string},
    children: ReadonlyArray<Element>
): React.ReactElement<getElement<React.ReactHTML[T]>>;

export function h<T extends keyof React.ReactHTML>(
    tag: T,
    key: string,
    classes: Array<string | false | undefined | null>,
    children: ReadonlyArray<Element>
): React.ReactElement<getElement<React.ReactHTML[T]>>;

export function h<T extends keyof React.ReactHTML>(
    tag: T,
    key: string,
    properties: getPropType<React.ReactHTML[T]> & {key?: string},
    children: ReadonlyArray<Element>
): React.ReactElement<getElement<React.ReactHTML[T]>>;

export function h<T extends keyof React.ReactHTML>(
    tag: T,
    key: string,
    children: ReadonlyArray<Element>
): React.ReactElement<React.ReactHTML[T]>;

export function h<P>(
    component: React.ComponentClass<P> | React.StatelessComponent<P>,
    key: string,
    children: ReadonlyArray<Element>
): React.ReactElement<P>;

export function h<U, P extends {children?: U}>(
  component: React.ComponentClass<P> | React.StatelessComponent<P>,
  key: string,
  children: U
): React.ReactElement<P>;

export function h<P>(
  component: React.ComponentClass<P> | React.StatelessComponent<P>,
  key: string,
  properties: P,
  children: ReadonlyArray<Element>
): React.ReactElement<P>;

export function h<U, P extends {children?: U}>(
    component: React.ComponentClass<P> | React.StatelessComponent<P>,
    key: string,
    properties: Without<P, "children">,
    children: U
): React.ReactElement<P>;

export function h(/*componentOrTag, classes?, properties?, children*/) {
  let componentOrTag, classes, properties: any, children, key;
  // if only one argument which is an array, wrap items with React.Fragment
  if (arguments.length === 1) {
    if (!Array.isArray(arguments[0])) {
      throw new Error("Calling h with only one argument implies calling it as a fragment wrapper. Did you mean to call `h(componentOrTag, [])`?");
    }
    return React.createElement(React.Fragment, {}, arguments[0]);
  } else {
    if (arguments.length === 5) {
      componentOrTag = arguments[0]
      key = arguments[1]
      classes = arguments[2]
      properties = arguments[3]
      children = arguments[4]
      if (!Array.isArray(classes)) {
        throw new Error("Classes should be an array");
      }
      if (!Array.isArray(children)) {
        throw new Error("children should be an array");
      }
    } else if (arguments.length === 4) {
      componentOrTag = arguments[0]
      key = arguments[1]
      if (Array.isArray(arguments[2])) {
        classes = arguments[2]
        properties = {}
      } else {
        classes = []
        properties = arguments[2]
      }
      children = arguments[3]
    } else if (arguments.length === 3) {
      componentOrTag = arguments[0]
      key = arguments[1]
      classes = []
      properties = {}
      children = arguments[2]
    } else {
      throw new Error("Unhandled H call")
    }
  }

  //make a copy of the properties object
  properties = properties ? Object.assign({}, properties) : {};

  // Supported nested dataset attributes
  if (properties.dataset) {
    Object.keys(properties.dataset).forEach(function unnest(attrName) {
      var dashedAttr = attrName.replace(/([a-z])([A-Z])/, function dash(match) {
        return match[0] + '-' + match[1].toLowerCase();
      });
      properties['data-' + dashedAttr] = properties.dataset[attrName];
    });

    properties.dataset = undefined;
  }

  // Support nested attributes
  if (properties.attributes) {
    Object.keys(properties.attributes).forEach(function unnest(attrName) {
      properties[attrName] = properties.attributes[attrName];
    });

    properties.attributes = undefined;
  }

  const propClasses = new Set((properties.className || "").split(" ").filter((x: any) => x !== ""))
  if (classes === undefined) {
    debugger;
  }
  for (const className of classes) {
    if (typeof className === "string" && className !== "") {
      propClasses.add(className)
    }
  }
  properties.className = Array.from(propClasses).join(" ")
  properties.key = key;
  // Create the element
  var args: any = [componentOrTag, properties].concat(children);
  return React.createElement.apply(React, args);
}
