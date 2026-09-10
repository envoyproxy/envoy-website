(() => {
  const controllerKey = "__envoyDocsBannerListeners";
  const previousController = globalThis[controllerKey];
  if (previousController instanceof AbortController) {
    previousController.abort();
  }
  const controller = new AbortController();
  globalThis[controllerKey] = controller;

  const DOCS_PREFIX = "/docs/envoy/";
  const VERSIONS_URL = `${DOCS_PREFIX}versions.json`;
  const OPEN_SHORTCUT = "V";
  const LIST_ID = "envoy-docs-banner-version-list";
  const MENU_ID = "envoy-docs-banner-version-menu";
  const HELP_ID = "envoy-docs-banner-help";
  const QUERY_ID = "envoy-docs-banner-query";

  const currentScript = document.currentScript;

  const isEditableTarget = (target) => target instanceof Element &&
    (target.closest("input, textarea, select, [contenteditable='true']") !== null);

  const readVersionFromPath = () => {
    if (!location.pathname.startsWith(DOCS_PREFIX)) {
      return null;
    }
    const rel = location.pathname.slice(DOCS_PREFIX.length);
    const [segment] = rel.split("/");
    if (!segment) {
      return null;
    }
    return segment;
  };

  const normalizeVersion = (version) => {
    if (!version) return "";
    if (version === "latest") return "latest";
    return version.replace(/^v/, "");
  };

  const versionFromUrl = readVersionFromPath();
  const currentVersion = normalizeVersion(
    currentScript?.dataset?.envoyDocsVersion || versionFromUrl || "",
  );

  if (!currentVersion) {
    return;
  }

  const relPath = (() => {
    const rel = location.pathname.slice(DOCS_PREFIX.length);
    const parts = rel.split("/");
    parts.shift();
    return parts.join("/");
  })();

  const withLeadingV = (version) => (version === "latest" ? version : `v${normalizeVersion(version)}`);

  const buildVersionLink = (version) => {
    const target = new URL(location.href);
    target.pathname = relPath
      ? `${DOCS_PREFIX}${withLeadingV(version)}/${relPath}`
      : `${DOCS_PREFIX}${withLeadingV(version)}/`;
    target.search = location.search;
    target.hash = location.hash;
    return `${target.pathname}${target.search}${target.hash}`;
  };

  fetch(VERSIONS_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`fetch failed: ${response.status}`);
      }
      return response.json();
    })
    .then((versions) => {
      const stable = versions.stable || {};
      const archived = versions.archived || {};
      const latestStable = normalizeVersion(versions.latest_stable || "");
      const allStable = Object.values(stable).flat();
      const allArchived = Object.values(archived).flat();

      const options = [];
      const pushOption = (version, state) => {
        if (!version) {
          return;
        }
        const normalized = normalizeVersion(version);
        if (options.some((option) => option.version === normalized)) {
          return;
        }
        options.push({ version: normalized, state });
      };

      pushOption("latest", "latest");
      pushOption(latestStable, "stable");
      allStable.forEach((version) => pushOption(version, "stable"));
      allArchived.forEach((version) => pushOption(version, "archived"));

      const currentDisplay = currentVersion === "latest"
        ? "Latest (development)"
        : `v${currentVersion}`;

      const banner = document.createElement("div");
      banner.className = "envoy-docs-banner";
      banner.innerHTML = `
        <div class="envoy-docs-banner__nav-row">
          <a class="envoy-docs-banner__logo" href="/" aria-label="Envoy home">
            <img src="/theme/images/envoy-logo.svg" alt="Envoy" />
          </a>
          <nav class="envoy-docs-banner__nav"><ul></ul></nav>
          <div class="envoy-docs-banner__version">
            <button type="button" class="envoy-docs-banner__version-button" aria-expanded="false">
              ${currentDisplay}
            </button>
            <div id="${MENU_ID}" class="envoy-docs-banner__menu" hidden>
              <p id="${HELP_ID}" class="envoy-docs-banner__help">Type to filter versions, ↑/↓ + Enter to navigate, Esc to close. Shortcut: Shift+V.</p>
              <p id="${QUERY_ID}" class="envoy-docs-banner__query" hidden>Filter: <span></span></p>
              <ul id="${LIST_ID}" class="envoy-docs-banner__list" role="listbox" aria-label="Envoy documentation versions"></ul>
            </div>
          </div>
        </div>
      `;

      const navRoot = banner.querySelector(".envoy-docs-banner__nav ul");
      for (const link of versions.nav || []) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = link.url;
        a.textContent = link.text;
        li.appendChild(a);
        navRoot.appendChild(li);
      }

      const versionButton = banner.querySelector(".envoy-docs-banner__version-button");
      const menu = banner.querySelector(".envoy-docs-banner__menu");
      const list = banner.querySelector(".envoy-docs-banner__list");
      const queryWrap = banner.querySelector(".envoy-docs-banner__query");
      const queryValue = queryWrap.querySelector("span");
      versionButton.setAttribute("aria-controls", MENU_ID);
      versionButton.setAttribute("aria-haspopup", "listbox");
      list.setAttribute("aria-describedby", `${HELP_ID} ${QUERY_ID}`);

      let isOpen = false;
      let filterText = "";
      let activeIndex = 0;
      let clearFilterTimer = null;

      const renderList = () => {
        const visible = options.filter((option) => {
          if (!filterText) {
            return true;
          }
          return option.version.includes(filterText);
        });
        if (!visible.length) {
          activeIndex = 0;
        } else if (activeIndex >= visible.length) {
          activeIndex = visible.length - 1;
        }

        list.innerHTML = "";
        visible.forEach((option, index) => {
          const item = document.createElement("li");
          item.role = "none";
          item.dataset.version = option.version;

          const button = document.createElement("button");
          button.type = "button";
          button.role = "option";
          button.className = "envoy-docs-banner__item";
          button.id = `envoy-docs-banner-option-${option.version.replaceAll(".", "-")}`;
          if (index === activeIndex) {
            button.classList.add("is-active");
          }
          button.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
          if (normalizeVersion(option.version) === currentVersion) {
            button.classList.add("is-current");
            button.setAttribute("aria-current", "true");
          }

          const label = document.createElement("span");
          label.textContent = option.version === "latest"
            ? "Latest (development)"
            : `v${option.version}`;

          const meta = document.createElement("span");
          meta.className = "envoy-docs-banner__item-meta";
          meta.textContent = option.state === "stable"
            ? "stable"
            : option.state === "archived"
            ? "archived"
            : "dev";

          button.appendChild(label);
          button.appendChild(meta);
          button.addEventListener(
            "click",
            () => navigateTo(option.version),
            { signal: controller.signal },
          );
          item.appendChild(button);
          list.appendChild(item);
        });

        const active = list.querySelector(".envoy-docs-banner__item.is-active");
        if (active?.id) {
          list.setAttribute("aria-activedescendant", active.id);
        } else {
          list.removeAttribute("aria-activedescendant");
        }

        queryWrap.hidden = !filterText;
        queryValue.textContent = filterText;
      };

      const closeMenu = () => {
        isOpen = false;
        filterText = "";
        activeIndex = 0;
        versionButton.setAttribute("aria-expanded", "false");
        menu.hidden = true;
        renderList();
        versionButton.focus();
      };

      const focusActiveOption = () => {
        const active = list.querySelector(".envoy-docs-banner__item.is-active");
        active?.focus();
      };

      const openMenu = () => {
        isOpen = true;
        versionButton.setAttribute("aria-expanded", "true");
        menu.hidden = false;
        renderList();
        focusActiveOption();
      };

      const navigateTo = async (targetVersion) => {
        closeMenu();
        location.assign(buildVersionLink(targetVersion));
      };

      versionButton.addEventListener("click", () => {
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      });

      document.addEventListener("click", (event) => {
        if (!isOpen) {
          return;
        }
        if (event.target instanceof Node && !banner.contains(event.target)) {
          closeMenu();
        }
      }, { signal: controller.signal });

      document.addEventListener("keydown", (event) => {
        if (
          !isOpen &&
          event.key.toLowerCase() === OPEN_SHORTCUT.toLowerCase() &&
          event.shiftKey &&
          !isEditableTarget(event.target)
        ) {
          event.preventDefault();
          openMenu();
          return;
        }

        if (!isOpen) {
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu();
          return;
        }

        const visible = options.filter((option) => !filterText || option.version.includes(filterText));

        if (event.key === "ArrowDown") {
          event.preventDefault();
          activeIndex = visible.length ? (activeIndex + 1) % visible.length : 0;
          renderList();
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          activeIndex = visible.length
            ? (activeIndex - 1 + visible.length) % visible.length
            : 0;
          renderList();
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          const selected = visible[activeIndex];
          if (selected) {
            navigateTo(selected.version);
          }
          return;
        }

        if (event.key === "Backspace") {
          event.preventDefault();
          filterText = filterText.slice(0, -1);
          activeIndex = 0;
          renderList();
          return;
        }

        const filterKey = event.key.toLowerCase();
        if (
          !event.shiftKey &&
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          /^[0-9.v]$/.test(filterKey)
        ) {
          event.preventDefault();
          filterText += filterKey.replace(/^v$/, "");
          activeIndex = 0;
          renderList();
          if (clearFilterTimer) {
            clearTimeout(clearFilterTimer);
          }
          clearFilterTimer = setTimeout(() => {
            filterText = "";
            activeIndex = 0;
            renderList();
          }, 1000);
        }
      }, { signal: controller.signal });

      document.querySelector(".envoy-docs-banner")?.remove();
      const mountPoint = document.getElementById("envoy-docs-banner") || banner;
      if (mountPoint === banner) {
        document.body.prepend(banner);
      } else {
        mountPoint.replaceWith(banner);
      }
      renderList();
    })
    .catch(() => {});
})();
