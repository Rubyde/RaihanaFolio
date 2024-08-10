const HSThemeAppearance = {
    init() {
        var theme = localStorage.getItem("hs_theme") || "default";
        if (!document.querySelector("html").classList.contains("dark")) {
            this.setAppearance(theme);
        }
    },
    _resetStylesOnLoad() {
        var style = document.createElement("style");
        style.innerText = "*{transition: unset !important;}";
        style.setAttribute("data-hs-appearance-onload-styles", "");
        document.head.appendChild(style);
        return style;
    },
    setAppearance(theme, saveToLocal = true, dispatchEvent = true) {
        const resetStyle = this._resetStylesOnLoad();
        if (saveToLocal) {
            localStorage.setItem("hs_theme", theme);
        }
        if (theme === "auto") {
            theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
        }
        document.querySelector("html").classList.remove("dark", "default", "auto");
        document.querySelector("html").classList.add(this.getOriginalAppearance());
        setTimeout(() => { resetStyle.remove() });
        if (dispatchEvent) {
            window.dispatchEvent(new CustomEvent("on-hs-appearance-change", { detail: theme }));
        }
    },
    getAppearance() {
        let appearance = this.getOriginalAppearance();
        if (appearance === "auto") {
            appearance = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
        }
        return appearance;
    },
    getOriginalAppearance() {
        return localStorage.getItem("hs_theme") || "default";
    }
};

HSThemeAppearance.init();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
    if (HSThemeAppearance.getOriginalAppearance() === "auto") {
        HSThemeAppearance.setAppearance("auto", false);
    }
});

window.addEventListener("load", () => {
    var themeClickElements = document.querySelectorAll("[data-hs-theme-click-value]");
    const themeSwitchElements = document.querySelectorAll("[data-hs-theme-switch]");
    
    themeClickElements.forEach(element => {
        element.addEventListener("click", () => HSThemeAppearance.setAppearance(element.getAttribute("data-hs-theme-click-value"), true, element));
    });

    themeSwitchElements.forEach(element => {
        element.addEventListener("change", event => {
            HSThemeAppearance.setAppearance(event.target.checked ? "dark" : "default");
        });
        element.checked = HSThemeAppearance.getAppearance() === "dark";
    });

    window.addEventListener("on-hs-appearance-change", event => {
        themeSwitchElements.forEach(element => {
            element.checked = event.detail === "dark";
        });
    });
});

const venobox = new VenoBox({
    selector: ".project-gallery-link",
    fitView: false,
    onPostOpen: function() {
        document.querySelector("body").style.overflowY = "hidden";
    },
    onPreClose: function() {
        document.querySelector("body").style.overflowY = "auto";
    }
});

const reviewCarousel = new Swiper(".review-carousel", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: {
        nextEl: ".review-carousel-button-next",
        prevEl: ".review-carousel-button-prev"
    },
    breakpoints: {
        1: { slidesPerView: 1 },
        768: { slidesPerView: 2 }
    }
});

const blogCarousel = new Swiper(".blog-carousel", {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: {
        nextEl: ".blog-carousel-button-next",
        prevEl: ".blog-carousel-button-prev"
    },
    breakpoints: {
        1: { slidesPerView: 1 },
        768: { slidesPerView: 2 }
    }
});

window.addEventListener("load", () => {
    document.querySelectorAll(".js-clipboard").forEach(clipboard => {
        const toggleTooltip = "false" !== HSStaticMethods.getClassProperty(clipboard, "--is-toggle-tooltip");
        new ClipboardJS(clipboard, {
            text: element => {
                var text = element.dataset.clipboardText;
                if (!text) {
                    var target = element.dataset.clipboardTarget;
                    element = document.querySelector(target);
                    text = (element.tagName === "SELECT" || element.tagName === "INPUT" || element.tagName === "TEXTAREA") ? element.value : element.textContent;
                }
                return text;
            }
        }).on("success", () => {
            const defaultElement = clipboard.querySelector(".js-clipboard-default");
            const successElement = clipboard.querySelector(".js-clipboard-success");
            const successTextElement = clipboard.querySelector(".js-clipboard-success-text");
            var successText = clipboard.dataset.clipboardSuccessText || "";
            const tooltipElement = clipboard.closest(".hs-tooltip");
            const tooltipInstance = HSTooltip.getInstance(tooltipElement, true);
            let originalSuccessText;

            if (successTextElement) {
                originalSuccessText = successTextElement.textContent;
                successTextElement.textContent = successText;
            }
            if (defaultElement && successElement) {
                defaultElement.style.display = "none";
                successElement.style.display = "block";
            }
            if (tooltipElement && toggleTooltip) {
                HSTooltip.show(tooltipElement);
            }
            if (tooltipElement && !toggleTooltip) {
                tooltipInstance.element.popperInstance.update();
            }
            setTimeout(() => {
                if (successTextElement && originalSuccessText) {
                    successTextElement.textContent = originalSuccessText;
                }
                if (tooltipElement && toggleTooltip) {
                    HSTooltip.hide(tooltipElement);
                }
                if (tooltipElement && !toggleTooltip) {
                    tooltipInstance.element.popperInstance.update();
                }
                if (defaultElement && successElement) {
                    successElement.style.display = "";
                    defaultElement.style.display = "";
                }
            }, 800);
        });
    });

    document.querySelectorAll(".move-with-cursor").forEach(element => {
        document.addEventListener("mousemove", event => {
            var x = event.clientX;
            var y = event.clientY;
            element.style.transition = "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
            element.style.transform = `translate(${0.01 * x}px, ${0.01 * y}px) rotate(${0.01 * (x + y)}deg)`;
        });
    });

    const form = document.querySelector("#contact-form");
    if (form) {
        const statusMessage = form.querySelector(".status");
        form.addEventListener("submit", event => {
            event.preventDefault();
            let formData = new FormData(form);
            let xhr = new XMLHttpRequest();
            xhr.open("POST", form.action);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    statusMessage.classList.remove("hidden", "alert-danger");
                    statusMessage.classList.add("alert-success");
                    statusMessage.textContent = xhr.responseText;
                    form.reset();
                } else {
                    statusMessage.classList.remove("hidden", "alert-success");
                    statusMessage.classList.add("alert-danger");
                    statusMessage.textContent = xhr.responseText || "Oops! An error occurred and your message could not be sent.";
                }
                setTimeout(() => {
                    statusMessage.classList.add("hidden");
                }, 6000);
            };
            xhr.send(formData);
        });
    }
});
