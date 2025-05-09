(() => {
    "use strict";
    var e, t, n;
    ! function(e) {
        window.DotNet = e;
        const t = [],
            n = new Map,
            r = new Map,
            o = "__jsObjectId",
            s = "__byte[]";
        class a {
            constructor(e) {
                this._jsObject = e, this._cachedFunctions = new Map
            }
            findFunction(e) {
                const t = this._cachedFunctions.get(e);
                if (t) return t;
                let n, r = this._jsObject;
                if (e.split(".").forEach((t => {
                        if (!(t in r)) throw new Error(`Could not find '${e}' ('${t}' was undefined).`);
                        n = r, r = r[t]
                    })), r instanceof Function) return r = r.bind(n), this._cachedFunctions.set(e, r), r;
                throw new Error(`The value '${e}' is not a function.`)
            }
            getWrappedObject() {
                return this._jsObject
            }
        }
        const i = {},
            c = {
                0: new a(window)
            };
        c[0]._cachedFunctions.set("import", (e => ("string" == typeof e && e.startsWith("./") && (e = document.baseURI + e.substr(2)), import(e))));
        let l, u = 1,
            d = 1,
            f = null;

        function m(e) {
            t.push(e)
        }

        function h(e) {
            if (e && "object" == typeof e) {
                c[d] = new a(e);
                const t = {
                    [o]: d
                };
                return d++, t
            }
            throw new Error(`Cannot create a JSObjectReference from the value '${e}'.`)
        }

        function p(e) {
            let t = -1;
            if (e instanceof ArrayBuffer && (e = new Uint8Array(e)), e instanceof Blob) t = e.size;
            else {
                if (!(e.buffer instanceof ArrayBuffer)) throw new Error("Supplied value is not a typed array or blob.");
                if (void 0 === e.byteLength) throw new Error(`Cannot create a JSStreamReference from the value '${e}' as it doesn't have a byteLength.`);
                t = e.byteLength
            }
            const n = {
                __jsStreamReferenceLength: t
            };
            try {
                const t = h(e);
                n.__jsObjectId = t.__jsObjectId
            } catch (t) {
                throw new Error(`Cannot create a JSStreamReference from the value '${e}'.`)
            }
            return n
        }

        function y(e) {
            return e ? JSON.parse(e, ((e, n) => t.reduce(((t, n) => n(e, t)), n))) : null
        }

        function g(e, t, n, r) {
            const o = w();
            if (o.invokeDotNetFromJS) {
                const s = k(r),
                    a = o.invokeDotNetFromJS(e, t, n, s);
                return a ? y(a) : null
            }
            throw new Error("The current dispatcher does not support synchronous calls from JS to .NET. Use invokeMethodAsync instead.")
        }

        function b(e, t, n, r) {
            if (e && n) throw new Error(`For instance method calls, assemblyName should be null. Received '${e}'.`);
            const o = u++,
                s = new Promise(((e, t) => {
                    i[o] = {
                        resolve: e,
                        reject: t
                    }
                }));
            try {
                const s = k(r);
                w().beginInvokeDotNetFromJS(o, e, t, n, s)
            } catch (e) {
                v(o, !1, e)
            }
            return s
        }

        function w() {
            if (null !== f) return f;
            throw new Error("No .NET call dispatcher has been set.")
        }

        function v(e, t, n) {
            if (!i.hasOwnProperty(e)) throw new Error(`There is no pending async call with ID ${e}.`);
            const r = i[e];
            delete i[e], t ? r.resolve(n) : r.reject(n)
        }

        function E(e) {
            return e instanceof Error ? `${e.message}\n${e.stack}` : e ? e.toString() : "null"
        }

        function _(e, t) {
            const n = c[t];
            if (n) return n.findFunction(e);
            throw new Error(`JS object instance with ID ${t} does not exist (has it been disposed?).`)
        }

        function C(e) {
            delete c[e]
        }
        e.attachDispatcher = function(e) {
                f = e
            }, e.attachReviver = m, e.invokeMethod = function(e, t, ...n) {
                return g(e, t, null, n)
            }, e.invokeMethodAsync = function(e, t, ...n) {
                return b(e, t, null, n)
            }, e.createJSObjectReference = h, e.createJSStreamReference = p, e.disposeJSObjectReference = function(e) {
                const t = e && e.__jsObjectId;
                "number" == typeof t && C(t)
            },
            function(e) {
                e[e.Default = 0] = "Default", e[e.JSObjectReference = 1] = "JSObjectReference", e[e.JSStreamReference = 2] = "JSStreamReference", e[e.JSVoidResult = 3] = "JSVoidResult"
            }(l = e.JSCallResultType || (e.JSCallResultType = {})), e.jsCallDispatcher = {
                findJSFunction: _,
                disposeJSObjectReferenceById: C,
                invokeJSFromDotNet: (e, t, n, r) => {
                    const o = R(_(e, r).apply(null, y(t)), n);
                    return null == o ? null : k(o)
                },
                beginInvokeJSFromDotNet: (e, t, n, r, o) => {
                    const s = new Promise((e => {
                        e(_(t, o).apply(null, y(n)))
                    }));
                    e && s.then((t => k([e, !0, R(t, r)]))).then((t => w().endInvokeJSFromDotNet(e, !0, t)), (t => w().endInvokeJSFromDotNet(e, !1, JSON.stringify([e, !1, E(t)]))))
                },
                endInvokeDotNetFromJS: (e, t, n) => {
                    const r = t ? y(n) : new Error(n);
                    v(parseInt(e, 10), t, r)
                },
                receiveByteArray: (e, t) => {
                    n.set(e, t)
                },
                supplyDotNetStream: (e, t) => {
                    if (r.has(e)) {
                        const n = r.get(e);
                        r.delete(e), n.resolve(t)
                    } else {
                        const n = new S;
                        n.resolve(t), r.set(e, n)
                    }
                }
            };
        class A {
            constructor(e) {
                this._id = e
            }
            invokeMethod(e, ...t) {
                return g(null, e, this._id, t)
            }
            invokeMethodAsync(e, ...t) {
                return b(null, e, this._id, t)
            }
            dispose() {
                b(null, "__Dispose", this._id, null).catch((e => console.error(e)))
            }
            serializeAsArg() {
                return {
                    __dotNetObject: this._id
                }
            }
        }
        e.DotNetObject = A, m((function(e, t) {
            if (t && "object" == typeof t) {
                if (t.hasOwnProperty("__dotNetObject")) return new A(t.__dotNetObject);
                if (t.hasOwnProperty(o)) {
                    const e = t.__jsObjectId,
                        n = c[e];
                    if (n) return n.getWrappedObject();
                    throw new Error(`JS object instance with Id '${e}' does not exist. It may have been disposed.`)
                }
                if (t.hasOwnProperty(s)) {
                    const e = t["__byte[]"],
                        r = n.get(e);
                    if (void 0 === r) throw new Error(`Byte array index '${e}' does not exist.`);
                    return n.delete(e), r
                }
                if (t.hasOwnProperty("__dotNetStream")) return new I(t.__dotNetStream)
            }
            return t
        }));
        class I {
            constructor(e) {
                if (r.has(e)) this._streamPromise = r.get(e).streamPromise, r.delete(e);
                else {
                    const t = new S;
                    r.set(e, t), this._streamPromise = t.streamPromise
                }
            }
            stream() {
                return this._streamPromise
            }
            async arrayBuffer() {
                return new Response(await this.stream()).arrayBuffer()
            }
        }
        class S {
            constructor() {
                this.streamPromise = new Promise(((e, t) => {
                    this.resolve = e, this.reject = t
                }))
            }
        }

        function R(e, t) {
            switch (t) {
                case l.Default:
                    return e;
                case l.JSObjectReference:
                    return h(e);
                case l.JSStreamReference:
                    return p(e);
                case l.JSVoidResult:
                    return null;
                default:
                    throw new Error(`Invalid JS call result type '${t}'.`)
            }
        }
        let N = 0;

        function k(e) {
            return N = 0, JSON.stringify(e, O)
        }

        function O(e, t) {
            if (t instanceof A) return t.serializeAsArg();
            if (t instanceof Uint8Array) {
                f.sendByteArray(N, t);
                const e = {
                    [s]: N
                };
                return N++, e
            }
            return t
        }
    }(e || (e = {})),
    function(e) {
        e[e.prependFrame = 1] = "prependFrame", e[e.removeFrame = 2] = "removeFrame", e[e.setAttribute = 3] = "setAttribute", e[e.removeAttribute = 4] = "removeAttribute", e[e.updateText = 5] = "updateText", e[e.stepIn = 6] = "stepIn", e[e.stepOut = 7] = "stepOut", e[e.updateMarkup = 8] = "updateMarkup", e[e.permutationListEntry = 9] = "permutationListEntry", e[e.permutationListEnd = 10] = "permutationListEnd"
    }(t || (t = {})),
    function(e) {
        e[e.element = 1] = "element", e[e.text = 2] = "text", e[e.attribute = 3] = "attribute", e[e.component = 4] = "component", e[e.region = 5] = "region", e[e.elementReferenceCapture = 6] = "elementReferenceCapture", e[e.markup = 8] = "markup"
    }(n || (n = {}));
    class r {
        constructor(e, t) {
            this.componentId = e, this.fieldValue = t
        }
        static fromEvent(e, t) {
            const n = t.target;
            if (n instanceof Element) {
                const t = function(e) {
                    return e instanceof HTMLInputElement ? e.type && "checkbox" === e.type.toLowerCase() ? {
                        value: e.checked
                    } : {
                        value: e.value
                    } : e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement ? {
                        value: e.value
                    } : null
                }(n);
                if (t) return new r(e, t.value)
            }
            return null
        }
    }
    const o = new Map,
        s = new Map,
        a = [];

    function i(e) {
        return o.get(e)
    }

    function c(e) {
        const t = o.get(e);
        return (null == t ? void 0 : t.browserEventName) || e
    }

    function l(e, t) {
        e.forEach((e => o.set(e, t)))
    }

    function u(e) {
        const t = [];
        for (let n = 0; n < e.length; n++) {
            const r = e[n];
            t.push({
                identifier: r.identifier,
                clientX: r.clientX,
                clientY: r.clientY,
                screenX: r.screenX,
                screenY: r.screenY,
                pageX: r.pageX,
                pageY: r.pageY
            })
        }
        return t
    }

    function d(e) {
        return {
            detail: e.detail,
            screenX: e.screenX,
            screenY: e.screenY,
            clientX: e.clientX,
            clientY: e.clientY,
            offsetX: e.offsetX,
            offsetY: e.offsetY,
            pageX: e.pageX,
            pageY: e.pageY,
            movementX: e.movementX,
            movementY: e.movementY,
            button: e.button,
            buttons: e.buttons,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
            metaKey: e.metaKey,
            type: e.type
        }
    }
    l(["input", "change"], {
        createEventArgs: function(e) {
            const t = e.target;
            if (function(e) {
                    return -1 !== f.indexOf(e.getAttribute("type"))
                }(t)) {
                const e = function(e) {
                    const t = e.value,
                        n = e.type;
                    switch (n) {
                        case "date":
                        case "month":
                        case "week":
                            return t;
                        case "datetime-local":
                            return 16 === t.length ? t + ":00" : t;
                        case "time":
                            return 5 === t.length ? t + ":00" : t
                    }
                    throw new Error(`Invalid element type '${n}'.`)
                }(t);
                return {
                    value: e
                }
            }
            if (function(e) {
                    return e instanceof HTMLSelectElement && "select-multiple" === e.type
                }(t)) {
                const e = t;
                return {
                    value: Array.from(e.options).filter((e => e.selected)).map((e => e.value))
                }
            } {
                const e = function(e) {
                    return !!e && "INPUT" === e.tagName && "checkbox" === e.getAttribute("type")
                }(t);
                return {
                    value: e ? !!t.checked : t.value
                }
            }
        }
    }), l(["copy", "cut", "paste"], {
        createEventArgs: e => ({
            type: e.type
        })
    }), l(["drag", "dragend", "dragenter", "dragleave", "dragover", "dragstart", "drop"], {
        createEventArgs: e => {
            return {
                ...d(t = e),
                dataTransfer: t.dataTransfer ? {
                    dropEffect: t.dataTransfer.dropEffect,
                    effectAllowed: t.dataTransfer.effectAllowed,
                    files: Array.from(t.dataTransfer.files).map((e => e.name)),
                    items: Array.from(t.dataTransfer.items).map((e => ({
                        kind: e.kind,
                        type: e.type
                    }))),
                    types: t.dataTransfer.types
                } : null
            };
            var t
        }
    }), l(["focus", "blur", "focusin", "focusout"], {
        createEventArgs: e => ({
            type: e.type
        })
    }), l(["keydown", "keyup", "keypress"], {
        createEventArgs: e => {
            return {
                key: (t = e).key,
                code: t.code,
                location: t.location,
                repeat: t.repeat,
                ctrlKey: t.ctrlKey,
                shiftKey: t.shiftKey,
                altKey: t.altKey,
                metaKey: t.metaKey,
                type: t.type
            };
            var t
        }
    }), l(["contextmenu", "click", "mouseover", "mouseout", "mousemove", "mousedown", "mouseup", "mouseleave", "mouseenter", "dblclick"], {
        createEventArgs: e => d(e)
    }), l(["error"], {
        createEventArgs: e => {
            return {
                message: (t = e).message,
                filename: t.filename,
                lineno: t.lineno,
                colno: t.colno,
                type: t.type
            };
            var t
        }
    }), l(["loadstart", "timeout", "abort", "load", "loadend", "progress"], {
        createEventArgs: e => {
            return {
                lengthComputable: (t = e).lengthComputable,
                loaded: t.loaded,
                total: t.total,
                type: t.type
            };
            var t
        }
    }), l(["touchcancel", "touchend", "touchmove", "touchenter", "touchleave", "touchstart"], {
        createEventArgs: e => {
            return {
                detail: (t = e).detail,
                touches: u(t.touches),
                targetTouches: u(t.targetTouches),
                changedTouches: u(t.changedTouches),
                ctrlKey: t.ctrlKey,
                shiftKey: t.shiftKey,
                altKey: t.altKey,
                metaKey: t.metaKey,
                type: t.type
            };
            var t
        }
    }), l(["gotpointercapture", "lostpointercapture", "pointercancel", "pointerdown", "pointerenter", "pointerleave", "pointermove", "pointerout", "pointerover", "pointerup"], {
        createEventArgs: e => {
            return {
                ...d(t = e),
                pointerId: t.pointerId,
                width: t.width,
                height: t.height,
                pressure: t.pressure,
                tiltX: t.tiltX,
                tiltY: t.tiltY,
                pointerType: t.pointerType,
                isPrimary: t.isPrimary
            };
            var t
        }
    }), l(["wheel", "mousewheel"], {
        createEventArgs: e => {
            return {
                ...d(t = e),
                deltaX: t.deltaX,
                deltaY: t.deltaY,
                deltaZ: t.deltaZ,
                deltaMode: t.deltaMode
            };
            var t
        }
    }), l(["toggle"], {
        createEventArgs: () => ({})
    });
    const f = ["date", "datetime-local", "month", "time", "week"],
        m = new Map;
    let h, p, y = 0;
    const g = {
        async add(e, t, n) {
            if (!n) throw new Error("initialParameters must be an object, even if empty.");
            const r = "__bl-dynamic-root:" + (++y).toString();
            m.set(r, e);
            const o = await v().invokeMethodAsync("AddRootComponent", t, r),
                s = new w(o, p[t]);
            return await s.setParameters(n), s
        }
    };
    class b {
        invoke(e) {
            return this._callback(e)
        }
        setCallback(t) {
            this._selfJSObjectReference || (this._selfJSObjectReference = e.createJSObjectReference(this)), this._callback = t
        }
        getJSObjectReference() {
            return this._selfJSObjectReference
        }
        dispose() {
            this._selfJSObjectReference && e.disposeJSObjectReference(this._selfJSObjectReference)
        }
    }
    class w {
        constructor(e, t) {
            this._jsEventCallbackWrappers = new Map, this._componentId = e;
            for (const e of t) "eventcallback" === e.type && this._jsEventCallbackWrappers.set(e.name.toLowerCase(), new b)
        }
        setParameters(e) {
            const t = {},
                n = Object.entries(e || {}),
                r = n.length;
            for (const [e, r] of n) {
                const n = this._jsEventCallbackWrappers.get(e.toLowerCase());
                n && r ? (n.setCallback(r), t[e] = n.getJSObjectReference()) : t[e] = r
            }
            return v().invokeMethodAsync("SetRootComponentParameters", this._componentId, r, t)
        }
        async dispose() {
            if (null !== this._componentId) {
                await v().invokeMethodAsync("RemoveRootComponent", this._componentId), this._componentId = null;
                for (const e of this._jsEventCallbackWrappers.values()) e.dispose()
            }
        }
    }

    function v() {
        if (!h) throw new Error("Dynamic root components have not been enabled in this application.");
        return h
    }
    const E = new Map;
    let _;
    const C = new Promise((e => {
        _ = e
    }));

    function A(e, t, n) {
        return S(e, t.eventHandlerId, (() => I(e).invokeMethodAsync("DispatchEventAsync", t, n)))
    }

    function I(e) {
        const t = E.get(e);
        if (!t) throw new Error(`No interop methods are registered for renderer ${e}`);
        return t
    }
    let S = (e, t, n) => n();
    const R = j(["abort", "blur", "canplay", "canplaythrough", "change", "cuechange", "durationchange", "emptied", "ended", "error", "focus", "load", "loadeddata", "loadedmetadata", "loadend", "loadstart", "mouseenter", "mouseleave", "pointerenter", "pointerleave", "pause", "play", "playing", "progress", "ratechange", "reset", "scroll", "seeked", "seeking", "stalled", "submit", "suspend", "timeupdate", "toggle", "unload", "volumechange", "waiting", "DOMNodeInsertedIntoDocument", "DOMNodeRemovedFromDocument"]),
        N = {
            submit: !0
        },
        k = j(["click", "dblclick", "mousedown", "mousemove", "mouseup"]);
    class O {
        constructor(e) {
            this.browserRendererId = e, this.afterClickCallbacks = [];
            const t = ++O.nextEventDelegatorId;
            this.eventsCollectionKey = `_blazorEvents_${t}`, this.eventInfoStore = new F(this.onGlobalEvent.bind(this))
        }
        setListener(e, t, n, r) {
            const o = this.getEventHandlerInfosForElement(e, !0),
                s = o.getHandler(t);
            if (s) this.eventInfoStore.update(s.eventHandlerId, n);
            else {
                const s = {
                    element: e,
                    eventName: t,
                    eventHandlerId: n,
                    renderingComponentId: r
                };
                this.eventInfoStore.add(s), o.setHandler(t, s)
            }
        }
        getHandler(e) {
            return this.eventInfoStore.get(e)
        }
        removeListener(e) {
            const t = this.eventInfoStore.remove(e);
            if (t) {
                const e = t.element,
                    n = this.getEventHandlerInfosForElement(e, !1);
                n && n.removeHandler(t.eventName)
            }
        }
        notifyAfterClick(e) {
            this.afterClickCallbacks.push(e), this.eventInfoStore.addGlobalListener("click")
        }
        setStopPropagation(e, t, n) {
            this.getEventHandlerInfosForElement(e, !0).stopPropagation(t, n)
        }
        setPreventDefault(e, t, n) {
            this.getEventHandlerInfosForElement(e, !0).preventDefault(t, n)
        }
        onGlobalEvent(e) {
            if (!(e.target instanceof Element)) return;
            this.dispatchGlobalEventToAllElements(e.type, e);
            const t = (n = e.type, s.get(n));
            var n;
            t && t.forEach((t => this.dispatchGlobalEventToAllElements(t, e))), "click" === e.type && this.afterClickCallbacks.forEach((t => t(e)))
        }
        dispatchGlobalEventToAllElements(e, t) {
            const n = t.composedPath();
            let o = n.shift(),
                s = null,
                a = !1;
            const c = Object.prototype.hasOwnProperty.call(R, e);
            let l = !1;
            for (; o;) {
                const f = o,
                    m = this.getEventHandlerInfosForElement(f, !1);
                if (m) {
                    const n = m.getHandler(e);
                    if (n && (u = f, d = t.type, !((u instanceof HTMLButtonElement || u instanceof HTMLInputElement || u instanceof HTMLTextAreaElement || u instanceof HTMLSelectElement) && Object.prototype.hasOwnProperty.call(k, d) && u.disabled))) {
                        if (!a) {
                            const n = i(e);
                            s = (null == n ? void 0 : n.createEventArgs) ? n.createEventArgs(t) : {}, a = !0
                        }
                        Object.prototype.hasOwnProperty.call(N, t.type) && t.preventDefault(), A(this.browserRendererId, {
                            eventHandlerId: n.eventHandlerId,
                            eventName: e,
                            eventFieldInfo: r.fromEvent(n.renderingComponentId, t)
                        }, s)
                    }
                    m.stopPropagation(e) && (l = !0), m.preventDefault(e) && t.preventDefault()
                }
                o = c || l ? void 0 : n.shift()
            }
            var u, d
        }
        getEventHandlerInfosForElement(e, t) {
            return Object.prototype.hasOwnProperty.call(e, this.eventsCollectionKey) ? e[this.eventsCollectionKey] : t ? e[this.eventsCollectionKey] = new T : null
        }
    }
    O.nextEventDelegatorId = 0;
    class F {
        constructor(e) {
            this.globalListener = e, this.infosByEventHandlerId = {}, this.countByEventName = {}, a.push(this.handleEventNameAliasAdded.bind(this))
        }
        add(e) {
            if (this.infosByEventHandlerId[e.eventHandlerId]) throw new Error(`Event ${e.eventHandlerId} is already tracked`);
            this.infosByEventHandlerId[e.eventHandlerId] = e, this.addGlobalListener(e.eventName)
        }
        get(e) {
            return this.infosByEventHandlerId[e]
        }
        addGlobalListener(e) {
            if (e = c(e), Object.prototype.hasOwnProperty.call(this.countByEventName, e)) this.countByEventName[e]++;
            else {
                this.countByEventName[e] = 1;
                const t = Object.prototype.hasOwnProperty.call(R, e);
                document.addEventListener(e, this.globalListener, t)
            }
        }
        update(e, t) {
            if (Object.prototype.hasOwnProperty.call(this.infosByEventHandlerId, t)) throw new Error(`Event ${t} is already tracked`);
            const n = this.infosByEventHandlerId[e];
            delete this.infosByEventHandlerId[e], n.eventHandlerId = t, this.infosByEventHandlerId[t] = n
        }
        remove(e) {
            const t = this.infosByEventHandlerId[e];
            if (t) {
                delete this.infosByEventHandlerId[e];
                const n = c(t.eventName);
                0 == --this.countByEventName[n] && (delete this.countByEventName[n], document.removeEventListener(n, this.globalListener))
            }
            return t
        }
        handleEventNameAliasAdded(e, t) {
            if (Object.prototype.hasOwnProperty.call(this.countByEventName, e)) {
                const n = this.countByEventName[e];
                delete this.countByEventName[e], document.removeEventListener(e, this.globalListener), this.addGlobalListener(t), this.countByEventName[t] += n - 1
            }
        }
    }
    class T {
        constructor() {
            this.handlers = {}, this.preventDefaultFlags = null, this.stopPropagationFlags = null
        }
        getHandler(e) {
            return Object.prototype.hasOwnProperty.call(this.handlers, e) ? this.handlers[e] : null
        }
        setHandler(e, t) {
            this.handlers[e] = t
        }
        removeHandler(e) {
            delete this.handlers[e]
        }
        preventDefault(e, t) {
            return void 0 !== t && (this.preventDefaultFlags = this.preventDefaultFlags || {}, this.preventDefaultFlags[e] = t), !!this.preventDefaultFlags && this.preventDefaultFlags[e]
        }
        stopPropagation(e, t) {
            return void 0 !== t && (this.stopPropagationFlags = this.stopPropagationFlags || {}, this.stopPropagationFlags[e] = t), !!this.stopPropagationFlags && this.stopPropagationFlags[e]
        }
    }

    function j(e) {
        const t = {};
        return e.forEach((e => {
            t[e] = !0
        })), t
    }
    const D = Y("_blazorLogicalChildren"),
        L = Y("_blazorLogicalParent"),
        B = Y("_blazorLogicalEnd");

    function P(e, t) {
        if (e.childNodes.length > 0 && !t) throw new Error("New logical elements must start empty, or allowExistingContents must be true");
        return D in e || (e[D] = []), e
    }

    function M(e, t) {
        const n = document.createComment("!");
        return x(n, e, t), n
    }

    function x(e, t, n) {
        const r = e;
        if (e instanceof Comment && U(r) && U(r).length > 0) throw new Error("Not implemented: inserting non-empty logical container");
        if (H(r)) throw new Error("Not implemented: moving existing logical children");
        const o = U(t);
        if (n < o.length) {
            const t = o[n];
            t.parentNode.insertBefore(e, t), o.splice(n, 0, r)
        } else G(e, t), o.push(r);
        r[L] = t, D in r || (r[D] = [])
    }

    function $(e, t) {
        const n = U(e).splice(t, 1)[0];
        if (n instanceof Comment) {
            const e = U(n);
            if (e)
                for (; e.length > 0;) $(n, 0)
        }
        const r = n;
        r.parentNode.removeChild(r)
    }

    function H(e) {
        return e[L] || null
    }

    function J(e, t) {
        return U(e)[t]
    }

    function z(e) {
        const t = K(e);
        return "http://www.w3.org/2000/svg" === t.namespaceURI && "foreignObject" !== t.tagName
    }

    function U(e) {
        return e[D]
    }

    function W(e, t) {
        const n = U(e);
        t.forEach((e => {
            e.moveRangeStart = n[e.fromSiblingIndex], e.moveRangeEnd = X(e.moveRangeStart)
        })), t.forEach((t => {
            const r = document.createComment("marker");
            t.moveToBeforeMarker = r;
            const o = n[t.toSiblingIndex + 1];
            o ? o.parentNode.insertBefore(r, o) : G(r, e)
        })), t.forEach((e => {
            const t = e.moveToBeforeMarker,
                n = t.parentNode,
                r = e.moveRangeStart,
                o = e.moveRangeEnd;
            let s = r;
            for (; s;) {
                const e = s.nextSibling;
                if (n.insertBefore(s, t), s === o) break;
                s = e
            }
            n.removeChild(t)
        })), t.forEach((e => {
            n[e.toSiblingIndex] = e.moveRangeStart
        }))
    }

    function K(e) {
        if (e instanceof Element || e instanceof DocumentFragment) return e;
        if (e instanceof Comment) return e.parentNode;
        throw new Error("Not a valid logical element")
    }

    function V(e) {
        const t = U(H(e));
        return t[Array.prototype.indexOf.call(t, e) + 1] || null
    }

    function G(e, t) {
        if (t instanceof Element || t instanceof DocumentFragment) t.appendChild(e);
        else {
            if (!(t instanceof Comment)) throw new Error(`Cannot append node because the parent is not a valid logical element. Parent: ${t}`);
            {
                const n = V(t);
                n ? n.parentNode.insertBefore(e, n) : G(e, H(t))
            }
        }
    }

    function X(e) {
        if (e instanceof Element || e instanceof DocumentFragment) return e;
        const t = V(e);
        if (t) return t.previousSibling;
        {
            const t = H(e);
            return t instanceof Element || t instanceof DocumentFragment ? t.lastChild : X(t)
        }
    }

    function Y(e) {
        return "function" == typeof Symbol ? Symbol() : e
    }

    function q(e) {
        return `_bl_${e}`
    }
    e.attachReviver(((e, t) => t && "object" == typeof t && Object.prototype.hasOwnProperty.call(t, "__internalId") && "string" == typeof t.__internalId ? function(e) {
        const t = `[${q(e)}]`;
        return document.querySelector(t)
    }(t.__internalId) : t));
    const Z = "_blazorDeferredValue",
        Q = document.createElement("template"),
        ee = document.createElementNS("http://www.w3.org/2000/svg", "g"),
        te = {},
        ne = "__internal_",
        re = "preventDefault_",
        oe = "stopPropagation_";
    class se {
        constructor(e) {
            this.rootComponentIds = new Set, this.childComponentLocations = {}, this.eventDelegator = new O(e), this.eventDelegator.notifyAfterClick((e => {
                if (!he) return;
                if (0 !== e.button || function(e) {
                        return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey
                    }(e)) return;
                if (e.defaultPrevented) return;
                const t = function(e) {
                    const t = !window._blazorDisableComposedPath && e.composedPath && e.composedPath();
                    if (t) {
                        for (let e = 0; e < t.length; e++) {
                            const n = t[e];
                            if (n instanceof Element && "A" === n.tagName) return n
                        }
                        return null
                    }
                    return je(e.target, "A")
                }(e);
                if (t && function(e) {
                        const t = e.getAttribute("target");
                        return (!t || "_self" === t) && e.hasAttribute("href") && !e.hasAttribute("download")
                    }(t)) {
                    const n = Te(t.getAttribute("href"));
                    De(n) && (e.preventDefault(), Ie(n, !0, !1))
                }
            }))
        }
        attachRootComponentToLogicalElement(e, t, n) {
            this.attachComponentToElement(e, t), this.rootComponentIds.add(e), n || (te[e] = t)
        }
        updateComponent(e, t, n, r) {
            var o;
            const s = this.childComponentLocations[t];
            if (!s) throw new Error(`No element is currently associated with component ${t}`);
            const a = te[t];
            if (a) {
                const e = function(e) {
                    return e[B] || null
                }(a);
                delete te[t], e ? function(e, t) {
                    const n = H(e);
                    if (!n) throw new Error("Can't clear between nodes. The start node does not have a logical parent.");
                    const r = U(n),
                        o = r.indexOf(e) + 1,
                        s = r.indexOf(t);
                    for (let e = o; e <= s; e++) $(n, o);
                    e.textContent = "!"
                }(a, e) : function(e) {
                    let t;
                    for (; t = e.firstChild;) e.removeChild(t)
                }(a)
            }
            const i = null === (o = K(s)) || void 0 === o ? void 0 : o.getRootNode(),
                c = i && i.activeElement;
            this.applyEdits(e, t, s, 0, n, r), c instanceof HTMLElement && i && i.activeElement !== c && c.focus()
        }
        disposeComponent(e) {
            this.rootComponentIds.delete(e) && function(e) {
                const t = U(e);
                for (; t.length;) $(e, 0)
            }(this.childComponentLocations[e]), delete this.childComponentLocations[e]
        }
        disposeEventHandler(e) {
            this.eventDelegator.removeListener(e)
        }
        attachComponentToElement(e, t) {
            this.childComponentLocations[e] = t
        }
        applyEdits(e, n, r, o, s, a) {
            let i, c = 0,
                l = o;
            const u = e.arrayBuilderSegmentReader,
                d = e.editReader,
                f = e.frameReader,
                m = u.values(s),
                h = u.offset(s),
                p = h + u.count(s);
            for (let s = h; s < p; s++) {
                const u = e.diffReader.editsEntry(m, s),
                    h = d.editType(u);
                switch (h) {
                    case t.prependFrame: {
                        const t = d.newTreeIndex(u),
                            o = e.referenceFramesEntry(a, t),
                            s = d.siblingIndex(u);
                        this.insertFrame(e, n, r, l + s, a, o, t);
                        break
                    }
                    case t.removeFrame:
                        $(r, l + d.siblingIndex(u));
                        break;
                    case t.setAttribute: {
                        const t = d.newTreeIndex(u),
                            o = e.referenceFramesEntry(a, t),
                            s = J(r, l + d.siblingIndex(u));
                        if (!(s instanceof Element)) throw new Error("Cannot set attribute on non-element child");
                        this.applyAttribute(e, n, s, o);
                        break
                    }
                    case t.removeAttribute: {
                        const t = J(r, l + d.siblingIndex(u));
                        if (!(t instanceof Element)) throw new Error("Cannot remove attribute from non-element child");
                        {
                            const n = d.removedAttributeName(u);
                            this.tryApplySpecialProperty(e, t, n, null) || t.removeAttribute(n)
                        }
                        break
                    }
                    case t.updateText: {
                        const t = d.newTreeIndex(u),
                            n = e.referenceFramesEntry(a, t),
                            o = J(r, l + d.siblingIndex(u));
                        if (!(o instanceof Text)) throw new Error("Cannot set text content on non-text child");
                        o.textContent = f.textContent(n);
                        break
                    }
                    case t.updateMarkup: {
                        const t = d.newTreeIndex(u),
                            n = e.referenceFramesEntry(a, t),
                            o = d.siblingIndex(u);
                        $(r, l + o), this.insertMarkup(e, r, l + o, n);
                        break
                    }
                    case t.stepIn:
                        r = J(r, l + d.siblingIndex(u)), c++, l = 0;
                        break;
                    case t.stepOut:
                        r = H(r), c--, l = 0 === c ? o : 0;
                        break;
                    case t.permutationListEntry:
                        i = i || [], i.push({
                            fromSiblingIndex: l + d.siblingIndex(u),
                            toSiblingIndex: l + d.moveToSiblingIndex(u)
                        });
                        break;
                    case t.permutationListEnd:
                        W(r, i), i = void 0;
                        break;
                    default:
                        throw new Error(`Unknown edit type: ${h}`)
                }
            }
        }
        insertFrame(e, t, r, o, s, a, i) {
            const c = e.frameReader,
                l = c.frameType(a);
            switch (l) {
                case n.element:
                    return this.insertElement(e, t, r, o, s, a, i), 1;
                case n.text:
                    return this.insertText(e, r, o, a), 1;
                case n.attribute:
                    throw new Error("Attribute frames should only be present as leading children of element frames.");
                case n.component:
                    return this.insertComponent(e, r, o, a), 1;
                case n.region:
                    return this.insertFrameRange(e, t, r, o, s, i + 1, i + c.subtreeLength(a));
                case n.elementReferenceCapture:
                    if (r instanceof Element) return u = r, d = c.elementReferenceCaptureId(a), u.setAttribute(q(d), ""), 0;
                    throw new Error("Reference capture frames can only be children of element frames.");
                case n.markup:
                    return this.insertMarkup(e, r, o, a), 1;
                default:
                    throw new Error(`Unknown frame type: ${l}`)
            }
            var u, d
        }
        insertElement(e, t, r, o, s, a, i) {
            const c = e.frameReader,
                l = c.elementName(a),
                u = "svg" === l || z(r) ? document.createElementNS("http://www.w3.org/2000/svg", l) : document.createElement(l),
                d = P(u);
            let f = !1;
            const m = i + c.subtreeLength(a);
            for (let a = i + 1; a < m; a++) {
                const i = e.referenceFramesEntry(s, a);
                if (c.frameType(i) !== n.attribute) {
                    x(u, r, o), f = !0, this.insertFrameRange(e, t, d, 0, s, a, m);
                    break
                }
                this.applyAttribute(e, t, u, i)
            }
            f || x(u, r, o), u instanceof HTMLOptionElement ? this.trySetSelectValueFromOptionElement(u) : Z in u && ue(u, u._blazorDeferredValue)
        }
        trySetSelectValueFromOptionElement(e) {
            const t = this.findClosestAncestorSelectElement(e);
            if (! function(e) {
                    return !!e && Z in e
                }(t)) return !1;
            if (ce(t)) e.selected = -1 !== t._blazorDeferredValue.indexOf(e.value);
            else {
                if (t._blazorDeferredValue !== e.value) return !1;
                le(t, e.value), delete t._blazorDeferredValue
            }
            return !0
        }
        insertComponent(e, t, n, r) {
            const o = M(t, n),
                s = e.frameReader.componentId(r);
            this.attachComponentToElement(s, o)
        }
        insertText(e, t, n, r) {
            const o = e.frameReader.textContent(r);
            x(document.createTextNode(o), t, n)
        }
        insertMarkup(e, t, n, r) {
            const o = M(t, n),
                s = (a = e.frameReader.markupContent(r), z(t) ? (ee.innerHTML = a || " ", ee) : (Q.innerHTML = a || " ", Q.content));
            var a;
            let i = 0;
            for (; s.firstChild;) x(s.firstChild, o, i++)
        }
        applyAttribute(e, t, n, r) {
            const o = e.frameReader,
                s = o.attributeName(r),
                a = o.attributeEventHandlerId(r);
            if (a) {
                const e = ie(s);
                this.eventDelegator.setListener(n, e, a, t)
            } else this.tryApplySpecialProperty(e, n, s, r) || n.setAttribute(s, o.attributeValue(r))
        }
        tryApplySpecialProperty(e, t, n, r) {
            switch (n) {
                case "value":
                    return this.tryApplyValueProperty(e, t, r);
                case "checked":
                    return this.tryApplyCheckedProperty(e, t, r);
                default:
                    return !!n.startsWith(ne) && (this.applyInternalAttribute(e, t, n.substring(ne.length), r), !0)
            }
        }
        applyInternalAttribute(e, t, n, r) {
            const o = r ? e.frameReader.attributeValue(r) : null;
            if (n.startsWith(oe)) {
                const e = ie(n.substring(oe.length));
                this.eventDelegator.setStopPropagation(t, e, null !== o)
            } else {
                if (!n.startsWith(re)) throw new Error(`Unsupported internal attribute '${n}'`);
                {
                    const e = ie(n.substring(re.length));
                    this.eventDelegator.setPreventDefault(t, e, null !== o)
                }
            }
        }
        tryApplyValueProperty(e, t, n) {
            const r = e.frameReader;
            let o = n ? r.attributeValue(n) : null;
            switch (o && "INPUT" === t.tagName && (o = function(e, t) {
                    switch (t.getAttribute("type")) {
                        case "time":
                            return 8 !== e.length || !e.endsWith("00") && t.hasAttribute("step") ? e : e.substring(0, 5);
                        case "datetime-local":
                            return 19 !== e.length || !e.endsWith("00") && t.hasAttribute("step") ? e : e.substring(0, 16);
                        default:
                            return e
                    }
                }(o, t)), t.tagName) {
                case "INPUT":
                case "SELECT":
                case "TEXTAREA":
                    return o && t instanceof HTMLSelectElement && ce(t) && (o = JSON.parse(o)), ue(t, o), t._blazorDeferredValue = o, !0;
                case "OPTION":
                    return o || "" === o ? t.setAttribute("value", o) : t.removeAttribute("value"), this.trySetSelectValueFromOptionElement(t), !0;
                default:
                    return !1
            }
        }
        tryApplyCheckedProperty(e, t, n) {
            if ("INPUT" === t.tagName) {
                const r = n ? e.frameReader.attributeValue(n) : null;
                return t.checked = null !== r, !0
            }
            return !1
        }
        findClosestAncestorSelectElement(e) {
            for (; e;) {
                if (e instanceof HTMLSelectElement) return e;
                e = e.parentElement
            }
            return null
        }
        insertFrameRange(e, t, n, r, o, s, a) {
            const i = r;
            for (let i = s; i < a; i++) {
                const s = e.referenceFramesEntry(o, i);
                r += this.insertFrame(e, t, n, r, o, s, i), i += ae(e, s)
            }
            return r - i
        }
    }

    function ae(e, t) {
        const r = e.frameReader;
        switch (r.frameType(t)) {
            case n.component:
            case n.element:
            case n.region:
                return r.subtreeLength(t) - 1;
            default:
                return 0
        }
    }

    function ie(e) {
        if (e.startsWith("on")) return e.substring(2);
        throw new Error(`Attribute should be an event name, but doesn't start with 'on'. Value: '${e}'`)
    }

    function ce(e) {
        return "select-multiple" === e.type
    }

    function le(e, t) {
        e.value = t || ""
    }

    function ue(e, t) {
        e instanceof HTMLSelectElement ? ce(e) ? function(e, t) {
            t || (t = []);
            for (let n = 0; n < e.options.length; n++) e.options[n].selected = -1 !== t.indexOf(e.options[n].value)
        }(e, t) : le(e, t) : e.value = t
    }
    const de = {};
    let fe = !1;

    function me(e, t, n, r) {
        let o = de[e];
        o || (o = new se(e), de[e] = o), o.attachRootComponentToLogicalElement(n, t, r)
    }
    let he = !1,
        pe = !1,
        ye = !1,
        ge = 0,
        be = 0,
        we = null,
        ve = null,
        Ee = async function(e) {
            var t, n, r;
            if (Re(), ye) {
                const o = null !== (n = null === (t = e.state) || void 0 === t ? void 0 : t._index) && void 0 !== n ? n : 0,
                    s = null === (r = e.state) || void 0 === r ? void 0 : r.userState,
                    a = o - ge,
                    i = location.href;
                if (await Se(-a), !await Ne(i, s, !1)) return;
                await Se(a)
            }
            await ke(!1)
        }, _e = null;
    const Ce = {
        listenForNavigationEvents: function(e, t) {
            var n, r;
            we = e, ve = t, pe || (pe = !0, window.addEventListener("popstate", Oe), ge = null !== (r = null === (n = history.state) || void 0 === n ? void 0 : n._index) && void 0 !== r ? r : 0)
        },
        enableNavigationInterception: function() {
            he = !0
        },
        setHasLocationChangingListeners: function(e) {
            ye = e
        },
        endLocationChanging: function(e, t) {
            _e && e === be && (_e(t), _e = null)
        },
        navigateTo: function(e, t) {
            Ae(e, t, !0)
        },
        getBaseURI: () => document.baseURI,
        getLocationHref: () => location.href
    };

    function Ae(e, t, n = !1) {
        const r = Te(e);
        !t.forceLoad && De(r) ? Ie(r, !1, t.replaceHistoryEntry, t.historyEntryState, n) : function(e, t) {
            if (location.href === e) {
                const t = e + "?";
                history.replaceState(null, "", t), location.replace(e)
            } else t ? location.replace(e) : location.href = e
        }(e, t.replaceHistoryEntry)
    }
    async function Ie(e, t, n, r, o = !1) {
        Re(), (o || !ye || await Ne(e, r, t)) && (fe = !0, n ? history.replaceState({
            userState: r,
            _index: ge
        }, "", e) : (ge++, history.pushState({
            userState: r,
            _index: ge
        }, "", e)), await ke(t))
    }

    function Se(e) {
        return new Promise((t => {
            const n = Ee;
            Ee = () => {
                Ee = n, t()
            }, history.go(e)
        }))
    }

    function Re() {
        _e && (_e(!1), _e = null)
    }

    function Ne(e, t, n) {
        return new Promise((r => {
            Re(), ve ? (be++, _e = r, ve(be, e, t, n)) : r(!1)
        }))
    }
    async function ke(e) {
        var t;
        we && await we(location.href, null === (t = history.state) || void 0 === t ? void 0 : t.userState, e)
    }
    async function Oe(e) {
        var t, n;
        Ee && await Ee(e), ge = null !== (n = null === (t = history.state) || void 0 === t ? void 0 : t._index) && void 0 !== n ? n : 0
    }
    let Fe;

    function Te(e) {
        return Fe = Fe || document.createElement("a"), Fe.href = e, Fe.href
    }

    function je(e, t) {
        return e ? e.tagName === t ? e : je(e.parentElement, t) : null
    }

    function De(e) {
        const t = (n = document.baseURI).substring(0, n.lastIndexOf("/"));
        var n;
        const r = e.charAt(t.length);
        return e.startsWith(t) && ("" === r || "/" === r || "?" === r || "#" === r)
    }
    const Le = {
            focus: function(e, t) {
                if (e instanceof HTMLElement) e.focus({
                    preventScroll: t
                });
                else {
                    if (!(e instanceof SVGElement)) throw new Error("Unable to focus an invalid element.");
                    if (!e.hasAttribute("tabindex")) throw new Error("Unable to focus an SVG element that does not have a tabindex.");
                    e.focus({
                        preventScroll: t
                    })
                }
            },
            focusBySelector: function(e) {
                const t = document.querySelector(e);
                t && (t.hasAttribute("tabindex") || (t.tabIndex = -1), t.focus())
            }
        },
        Be = {
            init: function(e, t, n, r = 50) {
                const o = Me(t);
                (o || document.documentElement).style.overflowAnchor = "none";
                const s = document.createRange();
                u(n.parentElement) && (t.style.display = "table-row", n.style.display = "table-row");
                const a = new IntersectionObserver((function(r) {
                    r.forEach((r => {
                        var o;
                        if (!r.isIntersecting) return;
                        s.setStartAfter(t), s.setEndBefore(n);
                        const a = s.getBoundingClientRect().height,
                            i = null === (o = r.rootBounds) || void 0 === o ? void 0 : o.height;
                        r.target === t ? e.invokeMethodAsync("OnSpacerBeforeVisible", r.intersectionRect.top - r.boundingClientRect.top, a, i) : r.target === n && n.offsetHeight > 0 && e.invokeMethodAsync("OnSpacerAfterVisible", r.boundingClientRect.bottom - r.intersectionRect.bottom, a, i)
                    }))
                }), {
                    root: o,
                    rootMargin: `${r}px`
                });
                a.observe(t), a.observe(n);
                const i = l(t),
                    c = l(n);

                function l(e) {
                    const t = {
                            attributes: !0
                        },
                        n = new MutationObserver(((n, r) => {
                            u(e.parentElement) && (r.disconnect(), e.style.display = "table-row", r.observe(e, t)), a.unobserve(e), a.observe(e)
                        }));
                    return n.observe(e, t), n
                }

                function u(e) {
                    return null !== e && (e instanceof HTMLTableElement && "" === e.style.display || "table" === e.style.display || e instanceof HTMLTableSectionElement && "" === e.style.display || "table-row-group" === e.style.display)
                }
                Pe[e._id] = {
                    intersectionObserver: a,
                    mutationObserverBefore: i,
                    mutationObserverAfter: c
                }
            },
            dispose: function(e) {
                const t = Pe[e._id];
                t && (t.intersectionObserver.disconnect(), t.mutationObserverBefore.disconnect(), t.mutationObserverAfter.disconnect(), e.dispose(), delete Pe[e._id])
            }
        },
        Pe = {};

    function Me(e) {
        return e && e !== document.body && e !== document.documentElement ? "visible" !== getComputedStyle(e).overflowY ? e : Me(e.parentElement) : null
    }
    const xe = {
            getAndRemoveExistingTitle: function() {
                var e;
                const t = document.head ? document.head.getElementsByTagName("title") : [];
                if (0 === t.length) return null;
                let n = null;
                for (let r = t.length - 1; r >= 0; r--) {
                    const o = t[r],
                        s = o.previousSibling;
                    s instanceof Comment && null !== H(s) || (null === n && (n = o.textContent), null === (e = o.parentNode) || void 0 === e || e.removeChild(o))
                }
                return n
            }
        },
        $e = {
            init: function(e, t) {
                t._blazorInputFileNextFileId = 0, t.addEventListener("click", (function() {
                    t.value = ""
                })), t.addEventListener("change", (function() {
                    t._blazorFilesById = {};
                    const n = Array.prototype.map.call(t.files, (function(e) {
                        const n = {
                            id: ++t._blazorInputFileNextFileId,
                            lastModified: new Date(e.lastModified).toISOString(),
                            name: e.name,
                            size: e.size,
                            contentType: e.type,
                            readPromise: void 0,
                            arrayBuffer: void 0,
                            blob: e
                        };
                        return t._blazorFilesById[n.id] = n, n
                    }));
                    e.invokeMethodAsync("NotifyChange", n)
                }))
            },
            toImageFile: async function(e, t, n, r, o) {
                const s = He(e, t),
                    a = await new Promise((function(e) {
                        const t = new Image;
                        t.onload = function() {
                            URL.revokeObjectURL(t.src), e(t)
                        }, t.onerror = function() {
                            t.onerror = null, URL.revokeObjectURL(t.src)
                        }, t.src = URL.createObjectURL(s.blob)
                    })),
                    i = await new Promise((function(e) {
                        var t;
                        const s = Math.min(1, r / a.width),
                            i = Math.min(1, o / a.height),
                            c = Math.min(s, i),
                            l = document.createElement("canvas");
                        l.width = Math.round(a.width * c), l.height = Math.round(a.height * c), null === (t = l.getContext("2d")) || void 0 === t || t.drawImage(a, 0, 0, l.width, l.height), l.toBlob(e, n)
                    })),
                    c = {
                        id: ++e._blazorInputFileNextFileId,
                        lastModified: s.lastModified,
                        name: s.name,
                        size: (null == i ? void 0 : i.size) || 0,
                        contentType: n,
                        blob: i || s.blob
                    };
                return e._blazorFilesById[c.id] = c, c
            },
            readFileData: async function(e, t) {
                return He(e, t).blob
            }
        };

    function He(e, t) {
        const n = e._blazorFilesById[t];
        if (!n) throw new Error(`There is no file with ID ${t}. The file list may have changed. See https://aka.ms/aspnet/blazor-input-file-multiple-selections.`);
        return n
    }
    const Je = new Set,
        ze = {
            enableNavigationPrompt: function(e) {
                0 === Je.size && window.addEventListener("beforeunload", Ue), Je.add(e)
            },
            disableNavigationPrompt: function(e) {
                Je.delete(e), 0 === Je.size && window.removeEventListener("beforeunload", Ue)
            }
        };

    function Ue(e) {
        e.preventDefault(), e.returnValue = !0
    }
    const We = new Map,
        Ke = {
            navigateTo: function(e, t, n = !1) {
                Ae(e, t instanceof Object ? t : {
                    forceLoad: t,
                    replaceHistoryEntry: n
                })
            },
            registerCustomEventType: function(e, t) {
                if (!t) throw new Error("The options parameter is required.");
                if (o.has(e)) throw new Error(`The event '${e}' is already registered.`);
                if (t.browserEventName) {
                    const n = s.get(t.browserEventName);
                    n ? n.push(e) : s.set(t.browserEventName, [e]), a.forEach((n => n(e, t.browserEventName)))
                }
                o.set(e, t)
            },
            rootComponents: g,
            _internal: {
                navigationManager: Ce,
                domWrapper: Le,
                Virtualize: Be,
                PageTitle: xe,
                InputFile: $e,
                NavigationLock: ze,
                getJSDataStreamChunk: async function(e, t, n) {
                    return e instanceof Blob ? await async function(e, t, n) {
                        const r = e.slice(t, t + n),
                            o = await r.arrayBuffer();
                        return new Uint8Array(o)
                    }(e, t, n): function(e, t, n) {
                        return new Uint8Array(e.buffer, e.byteOffset + t, n)
                    }(e, t, n)
                },
                receiveDotNetDataStream: function(t, n, r, o) {
                    let s = We.get(t);
                    if (!s) {
                        const n = new ReadableStream({
                            start(e) {
                                We.set(t, e), s = e
                            }
                        });
                        e.jsCallDispatcher.supplyDotNetStream(t, n)
                    }
                    o ? (s.error(o), We.delete(t)) : 0 === r ? (s.close(), We.delete(t)) : s.enqueue(n.length === r ? n : n.subarray(0, r))
                },
                attachWebRendererInterop: function(t, n, r, o) {
                    if (E.has(t)) throw new Error(`Interop methods are already registered for renderer ${t}`);
                    E.set(t, n), Object.keys(r).length > 0 && function(t, n, r) {
                        if (h) throw new Error("Dynamic root components have already been enabled.");
                        h = t, p = n;
                        for (const [t, o] of Object.entries(r)) {
                            const r = e.jsCallDispatcher.findJSFunction(t, 0);
                            for (const e of o) r(e, n[e])
                        }
                    }(I(t), r, o), _()
                }
            }
        };
    let Ve;

    function Ge(e) {
        return Ve = e, Ve
    }
    var Xe, Ye;
    window.Blazor = Ke;
    const qe = navigator,
        Ze = qe.userAgentData && qe.userAgentData.brands,
        Qe = Ze ? Ze.some((e => "Google Chrome" === e.brand || "Microsoft Edge" === e.brand || "Chromium" === e.brand)) : window.chrome,
        et = null !== (Ye = null === (Xe = qe.userAgentData) || void 0 === Xe ? void 0 : Xe.platform) && void 0 !== Ye ? Ye : navigator.platform;
    let tt = !1,
        nt = !1;

    function rt() {
        return (tt || nt) && Qe
    }
    let ot = !1;

    function st() {
        const e = document.querySelector("#blazor-error-ui");
        e && (e.style.display = "block"), ot || (ot = !0, document.querySelectorAll("#blazor-error-ui .reload").forEach((e => {
            e.onclick = function(e) {
                location.reload(), e.preventDefault()
            }
        })), document.querySelectorAll("#blazor-error-ui .dismiss").forEach((e => {
            e.onclick = function(e) {
                const t = document.querySelector("#blazor-error-ui");
                t && (t.style.display = "none"), e.preventDefault()
            }
        })))
    }
    class at {
        constructor(e, t) {
            this.bootConfig = e, this.applicationEnvironment = t
        }
        static async initAsync(e, t) {
            const n = void 0 !== e ? e("manifest", "blazor.boot.json", "_framework/blazor.boot.json", "") : a("_framework/blazor.boot.json");
            let r;
            r = n ? "string" == typeof n ? await a(n) : await n : await a("_framework/blazor.boot.json");
            const o = t || r.headers.get("Blazor-Environment") || "Production",
                s = await r.json();
            return s.modifiableAssemblies = r.headers.get("DOTNET-MODIFIABLE-ASSEMBLIES"), s.aspnetCoreBrowserTools = r.headers.get("ASPNETCORE-BROWSER-TOOLS"), new at(s, o);

            function a(e) {
                return fetch(e, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-cache"
                })
            }
        }
    }
    var it;
    let ct, lt, ut, dt;
    ! function(e) {
        e[e.Sharded = 0] = "Sharded", e[e.All = 1] = "All", e[e.Invariant = 2] = "Invariant"
    }(it || (it = {}));
    const ft = Math.pow(2, 32),
        mt = Math.pow(2, 21) - 1;
    let ht = null;

    function pt(e) {
        return lt.getI32(e)
    }
    const yt = {
            start: async function(t) {
                (function(e) {
                    tt = !!e.bootConfig.resources.pdb, nt = e.bootConfig.debugBuild;
                    const t = et.match(/^Mac/i) ? "Cmd" : "Alt";
                    rt() && console.info(`Debugging hotkey: Shift+${t}+D (when application has focus)`), document.addEventListener("keydown", (e => {
                        e.shiftKey && (e.metaKey || e.altKey) && "KeyD" === e.code && (nt || tt ? Qe ? function() {
                            const e = document.createElement("a");
                            e.href = `_framework/debug?url=${encodeURIComponent(location.href)}`, e.target = "_blank", e.rel = "noopener noreferrer", e.click()
                        }() : console.error("Currently, only Microsoft Edge (80+), Google Chrome, or Chromium, are supported for debugging.") : console.error("Cannot start debugging, because the application was not compiled with debugging enabled."))
                    }))
                })(t), await async function(t) {
                    let n, r;
                    const o = new Promise(((e, t) => {
                            n = e, r = t
                        })),
                        s = async function(e) {
                            if ("undefined" == typeof WebAssembly || !WebAssembly.validate) throw new Error("This browser does not support WebAssembly.");
                            const t = Object.keys(e.bootConfig.resources.runtime).filter((e => e.startsWith("dotnet.") && e.endsWith(".js")))[0],
                                n = e.bootConfig.resources.runtime[t];
                            let r, o = `_framework/${t}`;
                            if (e.startOptions.loadBootResource) {
                                const r = "dotnetjs",
                                    s = e.startOptions.loadBootResource(r, t, o, n);
                                if ("string" == typeof s) o = s;
                                else if (s) throw new Error(`For a ${r} resource, custom loaders must supply a URI string.`)
                            }
                            if (e.bootConfig.cacheBootResources) {
                                const e = document.createElement("link");
                                e.rel = "modulepreload", e.href = o, e.crossOrigin = "anonymous", e.integrity = n, document.head.appendChild(e)
                            }
                            const s = new Promise((e => {
                                r = e
                            }));
                            globalThis.__onDotnetRuntimeLoaded = e => {
                                delete globalThis.__onDotnetRuntimeLoaded, r(e)
                            };
                            const a = new URL(o, document.baseURI).toString(),
                                {
                                    default: i
                                } = await import(a);
                            return i ? (delete globalThis.__onDotnetRuntimeLoaded, i) : await s
                        }(t), a = t.bootConfig.resources, i = window.Module || {}, c = ["DEBUGGING ENABLED"], l = e => c.indexOf(e) < 0 && console.log(e), u = e => {
                            console.error(e), st()
                        }, d = i.preRun || [], f = i.postRun || [];
                    i.preloadPlugins = [];
                    let m = 0;

                    function h() {
                        m++;
                        const e = m / b.length * 100;
                        document.documentElement.style.setProperty("--blazor-load-percentage", `${e}%`), document.documentElement.style.setProperty("--blazor-load-percentage-text", `"${Math.floor(e)}%"`)
                    }
                    const p = t.loadResources(a.assembly, (e => `_framework/${e}`), "assembly"),
                        y = t.loadResources(a.pdb || {}, (e => `_framework/${e}`), "pdb"),
                        g = t.loadResource("dotnet.wasm", "_framework/dotnet.wasm", t.bootConfig.resources.runtime["dotnet.wasm"], "dotnetwasm"),
                        b = p.concat(y, g);
                    b.forEach((e => e.response.then((e => h()))));
                    const w = "dotnet.timezones.blat";
                    let v, E;
                    if (t.bootConfig.resources.runtime.hasOwnProperty(w) && (v = t.loadResource(w, "_framework/dotnet.timezones.blat", t.bootConfig.resources.runtime["dotnet.timezones.blat"], "globalization"), b.push(v), v.response.then((e => h()))), t.bootConfig.icuDataMode !== it.Invariant) {
                        const e = t.startOptions.applicationCulture || navigator.languages && navigator.languages[0],
                            n = function(e, t) {
                                if (!t || e.icuDataMode === it.All) return "icudt.dat";
                                const n = t.split("-")[0];
                                return ["en", "fr", "it", "de", "es"].includes(n) ? "icudt_EFIGS.dat" : ["zh", "ko", "ja"].includes(n) ? "icudt_CJK.dat" : "icudt_no_CJK.dat"
                            }(t.bootConfig, e);
                        E = t.loadResource(n, `_framework/${n}`, t.bootConfig.resources.runtime[n], "globalization"), b.push(E), E.response.then((e => h()))
                    }
                    const _ = await s;
                    return await _((o => {
                        const {
                            MONO: s,
                            BINDING: a,
                            Module: c,
                            IMPORTS: m
                        } = o;
                        async function h(e, t) {
                            const n = `blazor:${e.name}`;
                            ut.addRunDependency(n);
                            try {
                                const n = await e.response.then((e => e.arrayBuffer())),
                                    r = new Uint8Array(n),
                                    s = ut._malloc(r.length);
                                new Uint8Array(ut.HEAPU8.buffer, s, r.length).set(r), lt.mono_wasm_add_assembly(t, s, r.length), lt.loaded_files.push((o = e.url, gt.href = o, gt.href))
                            } catch (e) {
                                return void r(e)
                            }
                            var o;
                            ut.removeRunDependency(n)
                        }
                        return ut = c, ct = a, lt = s, dt = m, {
                            ...i,
                            disableDotnet6Compatibility: !1,
                            preRun: [() => {
                                v && async function(e) {
                                    const t = "blazor:timezonedata";
                                    ut.addRunDependency(t);
                                    const n = await e.response,
                                        r = await n.arrayBuffer();
                                    ut.FS_createPath("/", "usr", !0, !0), ut.FS_createPath("/usr/", "share", !0, !0), ut.FS_createPath("/usr/share/", "zoneinfo", !0, !0), lt.mono_wasm_load_data_archive(new Uint8Array(r), "/usr/share/zoneinfo/"), ut.removeRunDependency(t)
                                }(v), E && async function(e) {
                                    const t = "blazor:icudata";
                                    ut.addRunDependency(t);
                                    const n = await e.response,
                                        r = new Uint8Array(await n.arrayBuffer()),
                                        o = lt.mono_wasm_load_bytes_into_heap(r);
                                    if (!lt.mono_wasm_load_icu_data(o)) throw new Error("Error loading ICU asset.");
                                    ut.removeRunDependency(t)
                                }(E), p.forEach((e => h(e, Et(e.name, ".dll")))), y.forEach((e => h(e, e.name))), Ke._internal.dotNetCriticalError = e => u(e || "(null)"), Ke._internal.getSatelliteAssemblies = e => {
                                    const n = ct.mono_array_to_js_array(e),
                                        r = t.bootConfig.resources.satelliteResources;
                                    if (r) {
                                        const e = Promise.all(n.filter((e => r.hasOwnProperty(e))).map((e => t.loadResources(r[e], (e => `_framework/${e}`), "assembly"))).reduce(((e, t) => e.concat(t)), new Array).map((async e => (await e.response).arrayBuffer())));
                                        return ct.js_to_mono_obj(e.then((e => (e.length && (Ke._internal.readSatelliteAssemblies = () => {
                                            const t = ct.mono_obj_array_new(e.length);
                                            for (let n = 0; n < e.length; n++) ct.mono_obj_array_set(t, n, ct.js_typed_array_to_array(new Uint8Array(e[n])));
                                            return t
                                        }), e.length))))
                                    }
                                    return ct.js_to_mono_obj(Promise.resolve(0))
                                };
                                const e = {};
                                Ke._internal.getLazyAssemblies = n => {
                                    const r = ct.mono_array_to_js_array(n),
                                        o = t.bootConfig.resources.lazyAssembly;
                                    if (!o) throw new Error("No assemblies have been marked as lazy-loadable. Use the 'BlazorWebAssemblyLazyLoad' item group in your project file to enable lazy loading an assembly.");
                                    const s = r.filter((e => o.hasOwnProperty(e)));
                                    if (s.length !== r.length) {
                                        const e = r.filter((e => !s.includes(e)));
                                        throw new Error(`${e.join()} must be marked with 'BlazorWebAssemblyLazyLoad' item group in your project file to allow lazy-loading.`)
                                    }
                                    let a;
                                    if (rt()) {
                                        const e = t.bootConfig.resources.pdb,
                                            n = s.map((e => Et(e, ".pdb")));
                                        e && (a = Promise.all(n.map((e => o.hasOwnProperty(e) ? t.loadResource(e, `_framework/${e}`, o[e], "pdb") : null)).map((async e => e ? (await e.response).arrayBuffer() : null))))
                                    }
                                    const i = Promise.all(s.map((e => t.loadResource(e, `_framework/${e}`, o[e], "assembly"))).map((async e => (await e.response).arrayBuffer())));
                                    return ct.js_to_mono_obj(Promise.all([i, a]).then((t => (e.assemblies = t[0], e.pdbs = t[1], e.assemblies.length && (Ke._internal.readLazyAssemblies = () => {
                                        const {
                                            assemblies: t
                                        } = e;
                                        if (!t) return ct.mono_obj_array_new(0);
                                        const n = ct.mono_obj_array_new(t.length);
                                        for (let e = 0; e < t.length; e++) {
                                            const r = t[e];
                                            ct.mono_obj_array_set(n, e, ct.js_typed_array_to_array(new Uint8Array(r)))
                                        }
                                        return n
                                    }, Ke._internal.readLazyPdbs = () => {
                                        const {
                                            assemblies: t,
                                            pdbs: n
                                        } = e;
                                        if (!t) return ct.mono_obj_array_new(0);
                                        const r = ct.mono_obj_array_new(t.length);
                                        for (let e = 0; e < t.length; e++) {
                                            const t = n && n[e] ? new Uint8Array(n[e]) : new Uint8Array;
                                            ct.mono_obj_array_set(r, e, ct.js_typed_array_to_array(t))
                                        }
                                        return r
                                    }), e.assemblies.length))))
                                }
                            }, ...d],
                            postRun: [() => {
                                t.bootConfig.debugBuild && t.bootConfig.cacheBootResources && t.logToConsole(), t.purgeUnusedCacheEntriesAsync(), t.bootConfig.icuDataMode === it.Sharded && (lt.mono_wasm_setenv("__BLAZOR_SHARDED_ICU", "1"), t.startOptions.applicationCulture && lt.mono_wasm_setenv("LANG", `${t.startOptions.applicationCulture}.UTF-8`));
                                let r = "UTC";
                                try {
                                    r = Intl.DateTimeFormat().resolvedOptions().timeZone
                                } catch {}
                                lt.mono_wasm_setenv("TZ", r || "UTC"), t.bootConfig.modifiableAssemblies && lt.mono_wasm_setenv("DOTNET_MODIFIABLE_ASSEMBLIES", t.bootConfig.modifiableAssemblies), t.bootConfig.aspnetCoreBrowserTools && lt.mono_wasm_setenv("__ASPNETCORE_BROWSER_TOOLS", t.bootConfig.aspnetCoreBrowserTools), lt.mono_wasm_load_runtime("appBinDir", rt() ? -1 : 0), lt.mono_wasm_runtime_ready();
                                try {
                                    ct.bind_static_method("invalid-fqn", "")
                                } catch (e) {}
                                dt.Blazor = {
                                        _internal: Ke._internal
                                    },
                                    function() {
                                        const t = wt("Microsoft.AspNetCore.Components.WebAssembly", "Microsoft.AspNetCore.Components.WebAssembly.Services.DefaultWebAssemblyJSRuntime", "InvokeDotNet"),
                                            n = wt("Microsoft.AspNetCore.Components.WebAssembly", "Microsoft.AspNetCore.Components.WebAssembly.Services.DefaultWebAssemblyJSRuntime", "BeginInvokeDotNet"),
                                            r = wt("Microsoft.AspNetCore.Components.WebAssembly", "Microsoft.AspNetCore.Components.WebAssembly.Services.DefaultWebAssemblyJSRuntime", "EndInvokeJS"),
                                            o = wt("Microsoft.AspNetCore.Components.WebAssembly", "Microsoft.AspNetCore.Components.WebAssembly.Services.DefaultWebAssemblyJSRuntime", "NotifyByteArrayAvailable");
                                        e.attachDispatcher({
                                            beginInvokeDotNetFromJS: (e, t, r, o, s) => {
                                                if (_t(), !o && !t) throw new Error("Either assemblyName or dotNetObjectId must have a non null value.");
                                                const a = o ? o.toString() : t;
                                                n(e ? e.toString() : null, a, r, s)
                                            },
                                            endInvokeJSFromDotNet: (e, t, n) => {
                                                r(n)
                                            },
                                            sendByteArray: (e, t) => {
                                                vt = t, o(e)
                                            },
                                            invokeDotNetFromJS: (e, n, r, o) => (_t(), t(e || null, n, r ? r.toString() : null, o))
                                        })
                                    }(), n(o)
                            }, ...f],
                            print: l,
                            printErr: u,
                            instantiateWasm: (e, t) => ((async () => {
                                let n;
                                try {
                                    const t = await g;
                                    n = await async function(e, t) {
                                        var n;
                                        const r = await e.response,
                                            o = "application/wasm" === (null === (n = r.headers) || void 0 === n ? void 0 : n.get("content-type"));
                                        if (o && "function" == typeof WebAssembly.instantiateStreaming) return (await WebAssembly.instantiateStreaming(r, t)).instance;
                                        {
                                            o || console.warn('WebAssembly resource does not have the expected content type "application/wasm", so falling back to slower ArrayBuffer instantiation.');
                                            const e = await r.arrayBuffer();
                                            return (await WebAssembly.instantiate(e, t)).instance
                                        }
                                    }(t, e)
                                } catch (e) {
                                    throw u(e.toString()), e
                                }
                                t(n)
                            })(), []),
                            onRuntimeInitialized: () => {
                                E || lt.mono_wasm_setenv("DOTNET_SYSTEM_GLOBALIZATION_INVARIANT", "1")
                            }
                        }
                    })), await o
                }(t)
            },
            callEntryPoint: async function(e) {
                const t = [
                    []
                ];
                try {
                    await ct.call_assembly_entry_point(e, t, "m")
                } catch (e) {
                    console.error(e), st()
                }
            },
            toUint8Array: function(e) {
                const t = bt(e),
                    n = pt(t),
                    r = new Uint8Array(n);
                return r.set(ut.HEAPU8.subarray(t + 4, t + 4 + n)), r
            },
            getArrayLength: function(e) {
                return pt(bt(e))
            },
            getArrayEntryPtr: function(e, t, n) {
                return bt(e) + 4 + t * n
            },
            getObjectFieldsBaseAddress: function(e) {
                return e + 8
            },
            readInt16Field: function(e, t) {
                return n = e + (t || 0), lt.getI16(n);
                var n
            },
            readInt32Field: function(e, t) {
                return pt(e + (t || 0))
            },
            readUint64Field: function(e, t) {
                return function(e) {
                    const t = e >> 2,
                        n = ut.HEAPU32[t + 1];
                    if (n > mt) throw new Error(`Cannot read uint64 with high order part ${n}, because the result would exceed Number.MAX_SAFE_INTEGER.`);
                    return n * ft + ut.HEAPU32[t]
                }(e + (t || 0))
            },
            readFloatField: function(e, t) {
                return n = e + (t || 0), lt.getF32(n);
                var n
            },
            readObjectField: function(e, t) {
                return pt(e + (t || 0))
            },
            readStringField: function(e, t, n) {
                const r = pt(e + (t || 0));
                if (0 === r) return null;
                if (n) {
                    const e = ct.unbox_mono_obj(r);
                    return "boolean" == typeof e ? e ? "" : null : e
                }
                let o;
                return ht ? (o = ht.stringCache.get(r), void 0 === o && (o = ct.conv_string(r), ht.stringCache.set(r, o))) : o = ct.conv_string(r), o
            },
            readStructField: function(e, t) {
                return e + (t || 0)
            },
            beginHeapLock: function() {
                return _t(), ht = new Ct, ht
            },
            invokeWhenHeapUnlocked: function(e) {
                ht ? ht.enqueuePostReleaseAction(e) : e()
            }
        },
        gt = document.createElement("a");

    function bt(e) {
        return e + 12
    }

    function wt(e, t, n) {
        const r = `[${e}] ${t}:${n}`;
        return ct.bind_static_method(r)
    }
    let vt = null;

    function Et(e, t) {
        const n = e.lastIndexOf(".");
        if (n < 0) throw new Error(`No extension to replace in '${e}'`);
        return e.substr(0, n) + t
    }

    function _t() {
        if (ht) throw new Error("Assertion failed - heap is currently locked")
    }
    class Ct {
        constructor() {
            this.stringCache = new Map
        }
        enqueuePostReleaseAction(e) {
            this.postReleaseActions || (this.postReleaseActions = []), this.postReleaseActions.push(e)
        }
        release() {
            var e;
            if (ht !== this) throw new Error("Trying to release a lock which isn't current");
            for (ht = null; null === (e = this.postReleaseActions) || void 0 === e ? void 0 : e.length;) this.postReleaseActions.shift()(), _t()
        }
    }
    class At {
        constructor(e) {
            this.batchAddress = e, this.arrayRangeReader = It, this.arrayBuilderSegmentReader = St, this.diffReader = Rt, this.editReader = Nt, this.frameReader = kt
        }
        updatedComponents() {
            return Ve.readStructField(this.batchAddress, 0)
        }
        referenceFrames() {
            return Ve.readStructField(this.batchAddress, It.structLength)
        }
        disposedComponentIds() {
            return Ve.readStructField(this.batchAddress, 2 * It.structLength)
        }
        disposedEventHandlerIds() {
            return Ve.readStructField(this.batchAddress, 3 * It.structLength)
        }
        updatedComponentsEntry(e, t) {
            return Ot(e, t, Rt.structLength)
        }
        referenceFramesEntry(e, t) {
            return Ot(e, t, kt.structLength)
        }
        disposedComponentIdsEntry(e, t) {
            const n = Ot(e, t, 4);
            return Ve.readInt32Field(n)
        }
        disposedEventHandlerIdsEntry(e, t) {
            const n = Ot(e, t, 8);
            return Ve.readUint64Field(n)
        }
    }
    const It = {
            structLength: 8,
            values: e => Ve.readObjectField(e, 0),
            count: e => Ve.readInt32Field(e, 4)
        },
        St = {
            structLength: 12,
            values: e => {
                const t = Ve.readObjectField(e, 0),
                    n = Ve.getObjectFieldsBaseAddress(t);
                return Ve.readObjectField(n, 0)
            },
            offset: e => Ve.readInt32Field(e, 4),
            count: e => Ve.readInt32Field(e, 8)
        },
        Rt = {
            structLength: 4 + St.structLength,
            componentId: e => Ve.readInt32Field(e, 0),
            edits: e => Ve.readStructField(e, 4),
            editsEntry: (e, t) => Ot(e, t, Nt.structLength)
        },
        Nt = {
            structLength: 20,
            editType: e => Ve.readInt32Field(e, 0),
            siblingIndex: e => Ve.readInt32Field(e, 4),
            newTreeIndex: e => Ve.readInt32Field(e, 8),
            moveToSiblingIndex: e => Ve.readInt32Field(e, 8),
            removedAttributeName: e => Ve.readStringField(e, 16)
        },
        kt = {
            structLength: 36,
            frameType: e => Ve.readInt16Field(e, 4),
            subtreeLength: e => Ve.readInt32Field(e, 8),
            elementReferenceCaptureId: e => Ve.readStringField(e, 16),
            componentId: e => Ve.readInt32Field(e, 12),
            elementName: e => Ve.readStringField(e, 16),
            textContent: e => Ve.readStringField(e, 16),
            markupContent: e => Ve.readStringField(e, 16),
            attributeName: e => Ve.readStringField(e, 16),
            attributeValue: e => Ve.readStringField(e, 24, !0),
            attributeEventHandlerId: e => Ve.readUint64Field(e, 8)
        };

    function Ot(e, t, n) {
        return Ve.getArrayEntryPtr(e, t, n)
    }
    class Ft {
        constructor(e, t, n) {
            this.bootConfig = e, this.cacheIfUsed = t, this.startOptions = n, this.usedCacheKeys = {}, this.networkLoads = {}, this.cacheLoads = {}
        }
        static async initAsync(e, t) {
            const n = await async function(e) {
                if (!e.cacheBootResources || "undefined" == typeof caches) return null;
                if (!1 === window.isSecureContext) return null;
                const t = `blazor-resources-${document.baseURI.substring(document.location.origin.length)}`;
                try {
                    return await caches.open(t) || null
                } catch {
                    return null
                }
            }(e);
            return new Ft(e, n, t)
        }
        loadResources(e, t, n) {
            return Object.keys(e).map((r => this.loadResource(r, t(r), e[r], n)))
        }
        loadResource(e, t, n, r) {
            return {
                name: e,
                url: t,
                response: this.cacheIfUsed ? this.loadResourceWithCaching(this.cacheIfUsed, e, t, n, r) : this.loadResourceWithoutCaching(e, t, n, r)
            }
        }
        logToConsole() {
            const e = Object.values(this.cacheLoads),
                t = Object.values(this.networkLoads),
                n = Tt(e),
                r = Tt(t),
                o = n + r;
            if (0 === o) return;
            const s = this.bootConfig.linkerEnabled ? "%c" : "\n%cThis application was built with linking (tree shaking) disabled. Published applications will be significantly smaller.";
            console.groupCollapsed(`%cblazor%c Loaded ${jt(o)} resources${s}`, "background: purple; color: white; padding: 1px 3px; border-radius: 3px;", "font-weight: bold;", "font-weight: normal;"), e.length && (console.groupCollapsed(`Loaded ${jt(n)} resources from cache`), console.table(this.cacheLoads), console.groupEnd()), t.length && (console.groupCollapsed(`Loaded ${jt(r)} resources from network`), console.table(this.networkLoads), console.groupEnd()), console.groupEnd()
        }
        async purgeUnusedCacheEntriesAsync() {
            const e = this.cacheIfUsed;
            if (e) {
                const t = (await e.keys()).map((async t => {
                    t.url in this.usedCacheKeys || await e.delete(t)
                }));
                await Promise.all(t)
            }
        }
        async loadResourceWithCaching(e, t, n, r, o) {
            if (!r || 0 === r.length) throw new Error("Content hash is required");
            const s = Te(`${n}.${r}`);
            let a;
            this.usedCacheKeys[s] = !0;
            try {
                a = await e.match(s)
            } catch {}
            if (a) {
                const e = parseInt(a.headers.get("content-length") || "0");
                return this.cacheLoads[t] = {
                    responseBytes: e
                }, a
            } {
                const a = await this.loadResourceWithoutCaching(t, n, r, o);
                return this.addToCacheAsync(e, t, s, a), a
            }
        }
        loadResourceWithoutCaching(e, t, n, r) {
            if (this.startOptions.loadBootResource) {
                const o = this.startOptions.loadBootResource(r, e, t, n);
                if (o instanceof Promise) return o;
                "string" == typeof o && (t = o)
            }
            return fetch(t, {
                cache: "no-cache",
                integrity: this.bootConfig.cacheBootResources ? n : void 0
            })
        }
        async addToCacheAsync(e, t, n, r) {
            const o = await r.clone().arrayBuffer(),
                s = function(e) {
                    if ("undefined" != typeof performance) return performance.getEntriesByName(e)[0]
                }(r.url),
                a = s && s.encodedBodySize || void 0;
            this.networkLoads[t] = {
                responseBytes: a
            };
            const i = new Response(o, {
                headers: {
                    "content-type": r.headers.get("content-type") || "",
                    "content-length": (a || r.headers.get("content-length") || "").toString()
                }
            });
            try {
                await e.put(n, i)
            } catch {}
        }
    }

    function Tt(e) {
        return e.reduce(((e, t) => e + (t.responseBytes || 0)), 0)
    }

    function jt(e) {
        return `${(e/1048576).toFixed(2)} MB`
    }
    class Dt {
        static async initAsync(e) {
            Ke._internal.getApplicationEnvironment = () => ct.js_string_to_mono_string(e.applicationEnvironment);
            const t = await Promise.all((e.bootConfig.config || []).filter((t => "appsettings.json" === t || t === `appsettings.${e.applicationEnvironment}.json`)).map((async e => ({
                name: e,
                content: await n(e)
            }))));
            async function n(e) {
                const t = await fetch(e, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-cache"
                });
                return new Uint8Array(await t.arrayBuffer())
            }
            Ke._internal.getConfig = e => {
                const n = ct.conv_string(e),
                    r = t.find((e => e.name === n));
                return r ? ct.js_typed_array_to_array(r.content) : void 0
            }
        }
    }
    class Lt {
        constructor(e) {
            this.preregisteredComponents = e;
            const t = {};
            for (let n = 0; n < e.length; n++) {
                const r = e[n];
                t[r.id] = r
            }
            this.componentsById = t
        }
        resolveRegisteredElement(e) {
            const t = Number.parseInt(e);
            return Number.isNaN(t) ? void 0 : function(e, t) {
                if (!e.parentNode) throw new Error(`Comment not connected to the DOM ${e.textContent}`);
                const n = e.parentNode,
                    r = P(n, !0),
                    o = U(r);
                return Array.from(n.childNodes).forEach((e => o.push(e))), e[L] = r, t && (e[B] = t, P(t)), P(e)
            }(this.componentsById[t].start, this.componentsById[t].end)
        }
        getParameterValues(e) {
            return this.componentsById[e].parameterValues
        }
        getParameterDefinitions(e) {
            return this.componentsById[e].parameterDefinitions
        }
        getTypeName(e) {
            return this.componentsById[e].typeName
        }
        getAssembly(e) {
            return this.componentsById[e].assembly
        }
        getId(e) {
            return this.preregisteredComponents[e].id
        }
        getCount() {
            return this.preregisteredComponents.length
        }
    }
    const Bt = /^\s*Blazor-Component-State:(?<state>[a-zA-Z0-9+/=]+)$/;

    function Pt(e) {
        var t;
        if (e.nodeType === Node.COMMENT_NODE) {
            const n = e.textContent || "",
                r = Bt.exec(n),
                o = r && r.groups && r.groups.state;
            return o && (null === (t = e.parentNode) || void 0 === t || t.removeChild(e)), o
        }
        if (!e.hasChildNodes()) return;
        const n = e.childNodes;
        for (let e = 0; e < n.length; e++) {
            const t = Pt(n[e]);
            if (t) return t
        }
    }

    function Mt(e, t) {
        if (!e.hasChildNodes()) return [];
        const n = [],
            r = new zt(e.childNodes);
        for (; r.next() && r.currentElement;) {
            const e = $t(r, t);
            if (e) n.push(e);
            else {
                const e = Mt(r.currentElement, t);
                for (let t = 0; t < e.length; t++) {
                    const r = e[t];
                    n.push(r)
                }
            }
        }
        return n
    }
    const xt = new RegExp(/^\s*Blazor:[^{]*(?<descriptor>.*)$/);

    function $t(e, t) {
        const n = e.currentElement;
        if (n && n.nodeType === Node.COMMENT_NODE && n.textContent) {
            const r = xt.exec(n.textContent),
                o = r && r.groups && r.groups.descriptor;
            if (!o) return;
            try {
                const r = function(e) {
                    const t = JSON.parse(e),
                        {
                            type: n
                        } = t;
                    if ("server" !== n && "webassembly" !== n) throw new Error(`Invalid component type '${n}'.`);
                    return t
                }(o);
                switch (t) {
                    case "webassembly":
                        return function(e, t, n) {
                            const {
                                type: r,
                                assembly: o,
                                typeName: s,
                                parameterDefinitions: a,
                                parameterValues: i,
                                prerenderId: c
                            } = e;
                            if ("webassembly" === r) {
                                if (!o) throw new Error("assembly must be defined when using a descriptor.");
                                if (!s) throw new Error("typeName must be defined when using a descriptor.");
                                if (c) {
                                    const e = Ht(c, n);
                                    if (!e) throw new Error(`Could not find an end component comment for '${t}'`);
                                    return {
                                        type: r,
                                        assembly: o,
                                        typeName: s,
                                        parameterDefinitions: a && atob(a),
                                        parameterValues: i && atob(i),
                                        start: t,
                                        prerenderId: c,
                                        end: e
                                    }
                                }
                                return {
                                    type: r,
                                    assembly: o,
                                    typeName: s,
                                    parameterDefinitions: a && atob(a),
                                    parameterValues: i && atob(i),
                                    start: t
                                }
                            }
                        }(r, n, e);
                    case "server":
                        return function(e, t, n) {
                            const {
                                type: r,
                                descriptor: o,
                                sequence: s,
                                prerenderId: a
                            } = e;
                            if ("server" === r) {
                                if (!o) throw new Error("descriptor must be defined when using a descriptor.");
                                if (void 0 === s) throw new Error("sequence must be defined when using a descriptor.");
                                if (!Number.isInteger(s)) throw new Error(`Error parsing the sequence '${s}' for component '${JSON.stringify(e)}'`);
                                if (a) {
                                    const e = Ht(a, n);
                                    if (!e) throw new Error(`Could not find an end component comment for '${t}'`);
                                    return {
                                        type: r,
                                        sequence: s,
                                        descriptor: o,
                                        start: t,
                                        prerenderId: a,
                                        end: e
                                    }
                                }
                                return {
                                    type: r,
                                    sequence: s,
                                    descriptor: o,
                                    start: t
                                }
                            }
                        }(r, n, e)
                }
            } catch (e) {
                throw new Error(`Found malformed component comment at ${n.textContent}`)
            }
        }
    }

    function Ht(e, t) {
        for (; t.next() && t.currentElement;) {
            const n = t.currentElement;
            if (n.nodeType !== Node.COMMENT_NODE) continue;
            if (!n.textContent) continue;
            const r = xt.exec(n.textContent),
                o = r && r[1];
            if (o) return Jt(o, e), n
        }
    }

    function Jt(e, t) {
        const n = JSON.parse(e);
        if (1 !== Object.keys(n).length) throw new Error(`Invalid end of component comment: '${e}'`);
        const r = n.prerenderId;
        if (!r) throw new Error(`End of component comment must have a value for the prerendered property: '${e}'`);
        if (r !== t) throw new Error(`End of component comment prerendered property must match the start comment prerender id: '${t}', '${r}'`)
    }
    class zt {
        constructor(e) {
            this.childNodes = e, this.currentIndex = -1, this.length = e.length
        }
        next() {
            return this.currentIndex++, this.currentIndex < this.length ? (this.currentElement = this.childNodes[this.currentIndex], !0) : (this.currentElement = void 0, !1)
        }
    }
    class Ut {
        constructor(e, t, n, r, o, s, a) {
            this.id = Ut.globalId++, this.type = e, this.assembly = r, this.typeName = o, this.parameterDefinitions = s, this.parameterValues = a, this.start = t, this.end = n
        }
    }
    Ut.globalId = 1;
    class Wt {
        constructor() {
            this.afterStartedCallbacks = []
        }
        async importInitializersAsync(e, t) {
            await Promise.all(e.map((e => async function(e, n) {
                const r = function(e) {
                        const t = document.baseURI;
                        return t.endsWith("/") ? `${t}${e}` : `${t}/${e}`
                    }(n),
                    o = await import(r);
                if (void 0 === o) return;
                const {
                    beforeStart: s,
                    afterStarted: a
                } = o;
                return a && e.afterStartedCallbacks.push(a), s ? s(...t) : void 0
            }(this, e))))
        }
        async invokeAfterStartedCallbacks(e) {
            await C, await Promise.all(this.afterStartedCallbacks.map((t => t(e))))
        }
    }
    let Kt = !1;
    async function Vt(t) {
        if (Kt) throw new Error("Blazor has already started.");
        Kt = !0,
            function() {
                if (window.parent !== window && !window.opener && window.frameElement) {
                    const e = window.sessionStorage && window.sessionStorage["Microsoft.AspNetCore.Components.WebAssembly.Authentication.CachedAuthSettings"],
                        t = e && JSON.parse(e);
                    return t && t.redirect_uri && location.href.startsWith(t.redirect_uri)
                }
                return !1
            }() && await new Promise((() => {})), S = (e, t, n) => {
                const r = function(e) {
                    return de[e]
                }(e);
                r.eventDelegator.getHandler(t) && yt.invokeWhenHeapUnlocked(n)
            }, Ke._internal.applyHotReload = (t, n, r, o) => {
                e.invokeMethod("Microsoft.AspNetCore.Components.WebAssembly", "ApplyHotReloadDelta", t, n, r, o)
            }, Ke._internal.getApplyUpdateCapabilities = () => e.invokeMethod("Microsoft.AspNetCore.Components.WebAssembly", "GetApplyUpdateCapabilities"), Ke._internal.invokeJSFromDotNet = Gt, Ke._internal.endInvokeDotNetFromJS = Xt, Ke._internal.receiveByteArray = Yt, Ke._internal.retrieveByteArray = qt;
        const n = Ge(yt);
        Ke.platform = n, Ke._internal.renderBatch = (e, t) => {
            const n = yt.beginHeapLock();
            try {
                ! function(e, t) {
                    const n = de[e];
                    if (!n) throw new Error(`There is no browser renderer with ID ${e}.`);
                    const r = t.arrayRangeReader,
                        o = t.updatedComponents(),
                        s = r.values(o),
                        a = r.count(o),
                        i = t.referenceFrames(),
                        c = r.values(i),
                        l = t.diffReader;
                    for (let e = 0; e < a; e++) {
                        const r = t.updatedComponentsEntry(s, e),
                            o = l.componentId(r),
                            a = l.edits(r);
                        n.updateComponent(t, o, a, c)
                    }
                    const u = t.disposedComponentIds(),
                        d = r.values(u),
                        f = r.count(u);
                    for (let e = 0; e < f; e++) {
                        const r = t.disposedComponentIdsEntry(d, e);
                        n.disposeComponent(r)
                    }
                    const m = t.disposedEventHandlerIds(),
                        h = r.values(m),
                        p = r.count(m);
                    for (let e = 0; e < p; e++) {
                        const r = t.disposedEventHandlerIdsEntry(h, e);
                        n.disposeEventHandler(r)
                    }
                    fe && (fe = !1, window.scrollTo && window.scrollTo(0, 0))
                }(e, new At(t))
            } finally {
                n.release()
            }
        };
        const r = Ke._internal.navigationManager.getBaseURI,
            o = Ke._internal.navigationManager.getLocationHref;
        Ke._internal.navigationManager.getUnmarshalledBaseURI = () => ct.js_string_to_mono_string(r()), Ke._internal.navigationManager.getUnmarshalledLocationHref = () => ct.js_string_to_mono_string(o()), Ke._internal.navigationManager.listenForNavigationEvents((async (t, n, r) => {
            await e.invokeMethodAsync("Microsoft.AspNetCore.Components.WebAssembly", "NotifyLocationChanged", t, n, r)
        }), (async (t, n, r, o) => {
            const s = await e.invokeMethodAsync("Microsoft.AspNetCore.Components.WebAssembly", "NotifyLocationChangingAsync", n, r, o);
            Ke._internal.navigationManager.endLocationChanging(t, s)
        }));
        const s = null != t ? t : {},
            a = s.environment,
            i = at.initAsync(s.loadBootResource, a),
            c = function(e, t) {
                return function(e) {
                    const t = Mt(e, "webassembly"),
                        n = [];
                    for (let e = 0; e < t.length; e++) {
                        const r = t[e],
                            o = new Ut(r.type, r.start, r.end, r.assembly, r.typeName, r.parameterDefinitions, r.parameterValues);
                        n.push(o)
                    }
                    return n.sort(((e, t) => e.id - t.id))
                }(e)
            }(document),
            l = new Lt(c);
        Ke._internal.registeredComponents = {
            getRegisteredComponentsCount: () => l.getCount(),
            getId: e => l.getId(e),
            getAssembly: e => ct.js_string_to_mono_string(l.getAssembly(e)),
            getTypeName: e => ct.js_string_to_mono_string(l.getTypeName(e)),
            getParameterDefinitions: e => ct.js_string_to_mono_string(l.getParameterDefinitions(e) || ""),
            getParameterValues: e => ct.js_string_to_mono_string(l.getParameterValues(e) || "")
        }, Ke._internal.getPersistedState = () => ct.js_string_to_mono_string(Pt(document) || ""), Ke._internal.attachRootComponentToElement = (e, t, n) => {
            const r = l.resolveRegisteredElement(e);
            r ? me(n, r, t, !1) : function(e, t, n) {
                const r = "::after";
                let o = !1;
                if (e.endsWith(r)) e = e.slice(0, -r.length), o = !0;
                else if (e.endsWith("::before")) throw new Error("The '::before' selector is not supported.");
                const s = function(e) {
                    const t = m.get(e);
                    if (t) return m.delete(e), t
                }(e) || document.querySelector(e);
                if (!s) throw new Error(`Could not find any element matching selector '${e}'.`);
                me(n || 0, P(s, !0), t, o)
            }(e, t, n)
        };
        const u = await i,
            d = await async function(e, t) {
                const n = e.resources.libraryInitializers,
                    r = new Wt;
                return n && await r.importInitializersAsync(Object.keys(n), [t, e.resources.extensions]), r
            }(u.bootConfig, s), [f] = await Promise.all([Ft.initAsync(u.bootConfig, s || {}), Dt.initAsync(u)]);
        try {
            await n.start(f)
        } catch (e) {
            throw new Error(`Failed to start platform. Reason: ${e}`)
        }
        n.callEntryPoint(f.bootConfig.entryAssembly), d.invokeAfterStartedCallbacks(Ke)
    }

    function Gt(t, n, r, o) {
        const s = yt.readStringField(t, 0),
            a = yt.readInt32Field(t, 4),
            i = yt.readStringField(t, 8),
            c = yt.readUint64Field(t, 20);
        if (null !== i) {
            const n = yt.readUint64Field(t, 12);
            if (0 !== n) return e.jsCallDispatcher.beginInvokeJSFromDotNet(n, s, i, a, c), 0;
            {
                const t = e.jsCallDispatcher.invokeJSFromDotNet(s, i, a, c);
                return null === t ? 0 : ct.js_string_to_mono_string(t)
            }
        } {
            const t = e.jsCallDispatcher.findJSFunction(s, c).call(null, n, r, o);
            switch (a) {
                case e.JSCallResultType.Default:
                    return t;
                case e.JSCallResultType.JSObjectReference:
                    return e.createJSObjectReference(t).__jsObjectId;
                case e.JSCallResultType.JSStreamReference: {
                    const n = e.createJSStreamReference(t),
                        r = JSON.stringify(n);
                    return ct.js_string_to_mono_string(r)
                }
                case e.JSCallResultType.JSVoidResult:
                    return null;
                default:
                    throw new Error(`Invalid JS call result type '${a}'.`)
            }
        }
    }

    function Xt(t, n, r) {
        const o = ct.conv_string(t),
            s = 0 !== n,
            a = ct.conv_string(r);
        e.jsCallDispatcher.endInvokeDotNetFromJS(o, s, a)
    }

    function Yt(t, n) {
        const r = t,
            o = yt.toUint8Array(n);
        e.jsCallDispatcher.receiveByteArray(r, o)
    }

    function qt() {
        if (null === vt) throw new Error("Byte array not available for transfer");
        return ct.js_typed_array_to_array(vt)
    }
    Ke.start = Vt, document && document.currentScript && "false" !== document.currentScript.getAttribute("autostart") && Vt().catch((e => {
        void 0 !== ut && ut.printErr ? ut.printErr(e) : console.error(e)
    }))
})();
