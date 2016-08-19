
import {
    Component,
    ComponentResolver,
    Directive,
    ViewContainerRef,
    Input,
    Injector,
    ApplicationRef,
    DynamicComponentLoader
} from '@angular/core';

/**
  This component render an HTML code with inner directives on it.
  The @Input innerContent receives an array argument, the first array element
  is the code to be parsed. The second index is an array of Components that
  contains the directives present in the code.

  Example:

  <div [innerContent]="[
    'Go to <a [routerLink]="[Home]">Home page</a>',
    [RouterLink]
  ]">
**/
@Directive({
    selector: '[innerContent]'
})
export class InnerContent {
    @Input()
    set innerContent(content) {
        if (content) {
            debugger;
            this.renderTemplate(
                content[0],
                content[1]
            );
        }
    }

    constructor(
        private elementRef: ViewContainerRef,
        private injector: Injector,
        private app: ApplicationRef,
        private resolver: ComponentResolver,
        private loader: DynamicComponentLoader) {}

    public renderTemplate(template, directives) {
        let dynamicComponent = this.toComponent(template, directives);
        this.resolver.resolveComponent(
            dynamicComponent
        ).then(factory => {
            this.elementRef.createComponent(factory);
        });
    }

    private toComponent(template, directives = []) {
        @Component({
            selector: 'dynamic-content',
            template: template,
            directives: directives
        })
        class DynamicComponent {}
        return DynamicComponent;
    }
}