/* =========================================
   COMPUTER ASSEMBLY EDUCATIONAL GAME
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   GLOBAL GAME STATE
========================================= */

let currentMode = "practice";
let currentDifficulty = "easy";
let challengeDifficulty = "easy";

let assemblyStep = 0;
let assemblyScore = 0;
let assemblyMistakes = 0;

let disassemblyStep = 0;
let disassemblyScore = 0;
let disassemblyMistakes = 0;

let gameTimer = null;
let gameTimeLeft = 300;

let draggedComponent = null;
const equippedTools = new Set();
let tutorialStepIndex = 0;
const tutorialStepCount = 5;

const screwdriverRequiredComponents = new Set([
    "screw",
    "m2-ssd"
]);

const componentTips = {
    "cpu": {
        assembly: "Match the corner marker with the socket before lowering the processor. Never force it.",
        disassembly: "Lift the socket retention arm before carefully removing the processor."
    },
    "thermal-paste": {
        assembly: "A small amount of thermal paste helps heat move from the processor to its cooler.",
        disassembly: "Thermal paste can be messy. Keep the processor socket area clean."
    },
    "cpu-cooler": {
        assembly: "Evenly secure the cooler so it makes firm contact with the processor.",
        disassembly: "Loosen cooler fasteners evenly to avoid putting uneven pressure on the board."
    },
    "ram": {
        assembly: "Line up the notch in the memory module with the ridge in its slot.",
        disassembly: "Release the slot clips before lifting the memory module."
    },
    "m2-ssd": {
        assembly: "Slide the M.2 drive into its socket at an angle, then secure the far end with its small screw.",
        disassembly: "Remove the retaining screw before lifting the M.2 drive out of its socket."
    },
    "gpu": {
        assembly: "The graphics card uses the long expansion slot to connect to the system.",
        disassembly: "Release the expansion-slot latch before removing the graphics card."
    },
    "24-pins": {
        assembly: "The 24-pin lead supplies main power to the motherboard.",
        disassembly: "Press the connector latch before pulling the main power lead out."
    },
    "8-pins": {
        assembly: "The 8-pin CPU power lead supplies power to the processor area.",
        disassembly: "Release the connector latch before unplugging CPU power."
    },
    "sata-data-cable": {
        assembly: "A SATA data cable carries information between the motherboard and a compatible drive.",
        disassembly: "Pull the SATA connector straight out without twisting the cable."
    },
    "case-fan-cable": {
        assembly: "Connect the case-fan lead to a motherboard fan header; the fan itself belongs in the case.",
        disassembly: "Unplug the fan lead from its motherboard header without pulling on the wires."
    },
    "front-panel": {
        assembly: "Front-panel leads connect the case's power button and indicator lights.",
        disassembly: "Check the front-panel pin labels before disconnecting each small lead."
    },
    "screw": {
        assembly: "Secure the board with screws, but tighten them gently.",
        disassembly: "Remove the securing screws before lifting or moving the board."
    }
};


/* =========================================
   ASSEMBLY ORDER
========================================= */

const assemblyOrder = [
    "cpu",
    "thermal-paste",
    "cpu-cooler",
    "ram",
    "m2-ssd",
    "gpu",
    "24-pins",
    "8-pins",
    "front-panel",
    "screw"
];

/*
   The project contains a clear motherboard progression in these
   actual asset files: mobo.png, mobo v1.png ... mobo v10.png.
   These represent the visible board state after each completed step.
   Use the real image names instead of guessing custom names.
*/
const assemblyStateImages = [
    "mobo.png",
    "mobo v1.png",
    "mobo v2.png",
    "mobo v3.png",
    "mobo v4.png",
    "mobo v5.png",
    "mobo v6.png",
    "mobo v7.png",
    "mobo v8.png",
    "mobo v9.png",
    "mobo v10.png"
];


/* =========================================
   DISASSEMBLY ORDER
========================================= */

const disassemblyOrder =
    [...assemblyOrder].reverse();


/* =========================================
   COMPONENT INFORMATION
========================================= */

const componentInfo = {

    "cpu": {
        name: "CPU",
        image: "assets/images/cpu.png"
    },

    "thermal-paste": {
        name: "Thermal Paste",
        image: "assets/images/thermal-paste.png"
    },

    "cpu-cooler": {
        name: "CPU Cooler",
        image: "assets/images/cpu-cooler.png"
    },

    "ram": {
        name: "RAM",
        image: "assets/images/ram.png"
    },

    "psu": {
        name: "PSU",
        image: "assets/images/psu.png"
    },

    "ssd": {
        name: "SSD",
        image: "assets/images/ssd.png"
    },

    "m2-ssd": {
        name: "M.2 SSD",
        image: "assets/images/m2-ssd.png"
    },

    "gpu": {
        name: "GPU",
        image: "assets/images/gpu.png"
    },

    "case-fan": {
        name: "Case Fan",
        image: "assets/images/case-fan.png"
    },

    "case-fan-cable": {
        name: "Case Fan Cable",
        image: "assets/images/case-fan-cable.png"
    },

    "24-pins": {
        name: "24-Pin",
        image: "assets/images/24-pins.png"
    },

    "8-pins": {
        name: "8-Pin CPU",
        image: "assets/images/8-pins.png"
    },

    "sata-data-cable": {
        name: "SATA Data",
        image: "assets/images/sata-data-cable.png"
    },

    "front-panel": {
        name: "Front Panel",
        image: "assets/images/Front-panel-connectors.png"
    },

    "screw": {
        name: "Screw",
        image: "assets/images/screw.png"
    }
};

/* =========================================
   SCREEN NAVIGATION
========================================= */

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });


    const selectedScreen =
        document.getElementById(screenId);

    if (selectedScreen) {
        selectedScreen.classList.add("active");
    }

    if (screenId !== "splash") {
        startBackgroundMusic();
    }

    if (screenId === "tutorial") {
        updateTutorialStep(0);
    }


    /*
       Stop timers when leaving games.
    */

    if (
        screenId !== "assembly" &&
        screenId !== "disassembly" &&
        screenId !== "quiz"
    ) {
        stopGameTimer();
        stopQuizTimer();
    }
}


function startBackgroundMusic() {

    const music =
        document.getElementById("background-music");

    if (!music || !music.paused) {
        return;
    }

    const playback =
        music.play();

    if (playback) {
        playback.catch(error => {
            console.error("Unable to start background music:", error);
        });
    }
}


function updateTutorialStep(stepIndex) {

    tutorialStepIndex =
        Math.max(0, Math.min(stepIndex, tutorialStepCount - 1));

    document.querySelectorAll(".tutorial-step").forEach((step, index) => {
        const isActive = index === tutorialStepIndex;
        step.hidden = !isActive;
        step.classList.toggle("active", isActive);
    });

    const count =
        document.getElementById("tutorial-step-count");
    const progress =
        document.querySelector(".tutorial-progress");
    const fill =
        document.getElementById("tutorial-progress-fill");
    const previous =
        document.getElementById("tutorial-previous");
    const next =
        document.getElementById("tutorial-next");
    const practiceActions =
        document.getElementById("tutorial-practice-actions");

    if (count) {
        count.textContent =
            `Step ${tutorialStepIndex + 1} of ${tutorialStepCount}`;
    }

    if (progress) {
        progress.setAttribute(
            "aria-valuenow",
            String(tutorialStepIndex + 1)
        );
    }

    if (fill) {
        fill.style.width =
            `${((tutorialStepIndex + 1) / tutorialStepCount) * 100}%`;
    }

    if (previous) {
        previous.disabled = tutorialStepIndex === 0;
    }

    if (next) {
        next.hidden = tutorialStepIndex === tutorialStepCount - 1;
    }

    if (practiceActions) {
        practiceActions.hidden =
            tutorialStepIndex !== tutorialStepCount - 1;
    }
}


/* =========================================
   ARRAY SHUFFLE
========================================= */

function shuffleArray(array) {

    const shuffled = [...array];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];
    }

    return shuffled;
}


/* =========================================
   LEARN MODE
========================================= */

const learnComponentData = {

    "motherboard": {
        title: "Motherboard",
        category: "hardware",
        image: "assets/images/motherboard.png",
        description: "The main circuit board that connects the major components of a computer.",
        function: "Connects the CPU, memory, storage, and other devices so they can communicate.",
        location: "Mounted inside the case on motherboard standoffs.",
        tip: "Align its mounting holes with the case standoffs. Never let the board rest directly on the case."
    },

    "cpu": {
        title: "CPU",
        category: "hardware",
        image: "assets/images/cpu.png",
        description: "The Central Processing Unit processes instructions and performs calculations.",
        function: "Runs program instructions and coordinates many of the computer's operations.",
        location: "In the CPU socket on the motherboard, beneath the cooler.",
        tip: "Match the CPU and socket alignment marks, lower it gently, and never force it."
    },

    "ram": {
        title: "RAM",
        category: "hardware",
        image: "assets/images/ram.png",
        description: "Random Access Memory temporarily holds data and instructions that are in use.",
        function: "Gives the CPU fast access to active programs and data; it is cleared when power is off.",
        location: "In the long DIMM slots beside the CPU socket.",
        tip: "Line up the module notch with the slot key and press evenly until the retaining clips engage."
    },

    "cpu-cooler": {
        title: "CPU Cooler",
        category: "hardware",
        image: "assets/images/cpu-cooler.png",
        description: "The CPU cooler removes heat from the processor to help it operate safely.",
        function: "Transfers heat away from the CPU using a heatsink and, on many models, a fan.",
        location: "Mounted over the CPU, with its fan connected to the CPU_FAN header.",
        tip: "Apply thermal paste as directed by the cooler maker and tighten the cooler evenly."
    },

    "gpu": {
        title: "GPU",
        category: "hardware",
        image: "assets/images/gpu.png",
        description: "The Graphics Processing Unit handles graphics and other visual workloads.",
        function: "Renders images and video; a dedicated graphics card may also accelerate specialized tasks.",
        location: "Usually installed in a long PCIe expansion slot on the motherboard.",
        tip: "Check the card's power requirements and secure it to the case after seating it in the slot."
    },

    "psu": {
        title: "PSU",
        category: "hardware",
        image: "assets/images/psu.png",
        description: "The Power Supply Unit delivers electrical power to the computer's components.",
        function: "Converts wall power into regulated power used by the motherboard, drives, and other parts.",
        location: "Mounted in the case's PSU bay, commonly at the bottom or rear.",
        tip: "Use only cables made for that exact PSU model; modular PSU cables are not universally interchangeable."
    },

    "ssd": {
        title: "SSD",
        category: "hardware",
        image: "assets/images/ssd.png",
        description: "A Solid State Drive stores the operating system, applications, and files using flash memory.",
        function: "Provides persistent storage without moving parts.",
        location: "A 2.5-inch SATA SSD mounts in a drive bay and connects to SATA data and power.",
        tip: "A SATA SSD needs both a SATA data connection to the motherboard and power from the PSU."
    },

    "hdd": {
        title: "HDD",
        category: "hardware",
        image: "assets/images/hdd.png",
        description: "A Hard Disk Drive stores data magnetically on spinning platters.",
        function: "Provides persistent storage, often offering large capacity for files and backups.",
        location: "Secured in a compatible drive bay inside the case.",
        tip: "Mount it securely and connect both SATA power and SATA data cables."
    },

    "case-fan": {
        title: "Case Fan",
        category: "hardware",
        image: "assets/images/case-fan.png",
        description: "A case fan moves air through the computer to help manage heat.",
        function: "Moves cool air into the case or warm air out, depending on its orientation.",
        location: "Mounted on a case panel and connected to a fan header or fan hub.",
        tip: "Check the airflow arrows on the fan frame so intake and exhaust work together."
    },

    "cmos-battery": {
        title: "CMOS Battery",
        category: "hardware",
        image: "assets/images/cmos-battery.png",
        description: "The CMOS battery helps maintain the real-time clock and firmware settings while the PC is unplugged.",
        function: "Supplies standby power to the motherboard's clock and settings memory.",
        location: "In a small coin-cell holder on the motherboard.",
        tip: "Note the battery's orientation before replacement and use the type specified by the motherboard maker."
    },

    "pc-case": {
        title: "PC Case",
        category: "hardware",
        image: "assets/images/pc-case.png",
        description: "The case houses and protects the computer's components.",
        function: "Provides mounting points, protects hardware, and helps guide airflow through the system.",
        location: "The enclosure surrounding the motherboard, drives, PSU, and other internal components.",
        tip: "Check motherboard size compatibility and install the correct standoffs before mounting the board."
    },

    "m2-ssd": {
        title: "M.2 SSD",
        category: "hardware",
        image: "assets/images/m2-ssd.png",
        description: "A compact solid-state drive that plugs directly into an M.2 slot on the motherboard.",
        function: "Provides persistent storage; depending on the drive and slot, it uses SATA or PCIe/NVMe.",
        location: "Installed in a matching M.2 socket on the motherboard and secured at its far end.",
        tip: "Check the drive's length and the slot's supported interface, insert it at an angle, then secure it with the retaining screw."
    },

    "24-pins": {
        title: "24-Pin Cable",
        category: "cables",
        image: "assets/images/24-pins.png",
        description: "The main power cable from the PSU to the motherboard.",
        function: "Supplies the motherboard with its primary power connection.",
        location: "Connects the PSU's 24-pin lead to the large motherboard power socket, usually along its edge.",
        tip: "Align the latch with the socket tab and press until it is fully seated; do not force it backward."
    },

    "8-pins": {
        title: "8-Pin CPU Power",
        category: "cables",
        image: "assets/images/8-pins.png",
        description: "A dedicated PSU power lead for the processor power circuitry.",
        function: "Provides additional power to the CPU through the motherboard.",
        location: "Connects to the CPU power socket near the top edge of the motherboard.",
        tip: "Use the cable labeled CPU or EPS, not a similar-looking PCIe graphics-card power cable."
    },

    "sata-data-cable": {
        title: "SATA Data Cable",
        category: "cables",
        image: "assets/images/sata-data-cable.png",
        description: "A data cable between a SATA storage drive and the motherboard.",
        function: "Carries storage data; it does not power the drive.",
        location: "Runs from a drive's SATA data port to a SATA port on the motherboard.",
        tip: "Connect the separate SATA power lead too; the data cable alone cannot power a drive."
    },

    "sata-power-cable": {
        title: "SATA Power Cable",
        category: "cables",
        image: "assets/images/sata-power-cable.png",
        description: "A PSU cable that supplies power to compatible SATA drives.",
        function: "Powers SATA SSDs, HDDs, and some other accessories.",
        location: "Connects a SATA power plug from the PSU to the wide power port on a drive.",
        tip: "Match the L-shaped connector carefully and never force it into the data port."
    },

    "front-panel": {
        title: "Front Panel Connectors",
        category: "cables",
        image: "assets/images/Front-panel-connectors.png",
        description: "Small case leads for controls and indicator lights.",
        function: "Connects the power switch, reset switch, and status LEDs to the motherboard.",
        location: "Connects to the labeled front-panel header, often near a lower motherboard edge.",
        tip: "Use the motherboard manual to identify each pin; LED leads have polarity, while switches usually do not."
    },

    "screwdriver": {
        title: "Screwdriver",
        category: "tools",
        image: "assets/images/screwdriver.png",
        description: "A hand tool for installing or removing computer hardware screws.",
        function: "Secures parts such as the motherboard, drive, and case panels.",
        location: "Kept outside the PC and used at screw locations during assembly.",
        tip: "Choose a tip that fits the screw head and keep the tool away from powered electronics."
    },

    "screw": {
        title: "Screw",
        category: "tools",
        image: "assets/images/screw.png",
        description: "Fasteners secure components and case panels in place.",
        function: "Keeps hardware from shifting and maintains a stable installation.",
        location: "Used at matching threaded mounting points or case standoffs.",
        tip: "Use the correct screw for each part and tighten it gently to avoid damaging threads."
    },

    "thermal-paste": {
        title: "Thermal Paste",
        category: "tools",
        image: "assets/images/thermal-paste.png",
        description: "A heat-conductive compound used between a processor and its cooler.",
        function: "Fills tiny surface gaps to improve heat transfer from the CPU to the cooler.",
        location: "A small amount goes on the CPU heat spreader beneath the cooler.",
        tip: "Use the amount and method recommended by the cooler maker; keep paste off sockets and contacts."
    },

    "esd-wrist-strap": {
        title: "ESD Wrist Strap",
        category: "tools",
        image: "assets/images/esd-wrist-strap.png",
        description: "An anti-static strap helps reduce electrostatic discharge risk while handling parts.",
        function: "Helps keep your body and the hardware at the same electrical potential.",
        location: "Wear it on your wrist and connect it as directed to a suitable grounded point.",
        tip: "Handle circuit boards by their edges and follow the strap manufacturer's grounding instructions."
    },

    "anti-static-mat": {
        title: "Anti-Static Mat",
        category: "tools",
        image: "assets/images/anti-static-mat.png",
        description: "A work surface designed to reduce static buildup while handling electronics.",
        function: "Helps dissipate static charge when used as part of a properly grounded ESD setup.",
        location: "Place it on a stable workbench before laying out computer components.",
        tip: "Use it according to its grounding instructions; a mat does not replace careful component handling."
    }
};


function showLearnComponent(component) {

    const selected = learnComponentData[component];

    if (!selected) {
        return;
    }


    const image =
        document.getElementById("learn-main-image");

    const title =
        document.getElementById("learn-title");

    const description =
        document.getElementById("learn-description");

    const category =
        document.getElementById("learn-category");

    const componentFunction =
        document.getElementById("learn-function");

    const location =
        document.getElementById("learn-location");

    const tip =
        document.getElementById("learn-tip");

    if (image) {
        image.src = selected.image;
        image.alt = selected.title;
    }

    if (title) {
        title.textContent = selected.title;
    }

    if (description) {
        description.textContent =
            selected.description;
    }

    if (category) {
        category.textContent =
            selected.category === "tools"
                ? "TOOLS & SAFETY"
                : selected.category.toUpperCase();
    }

    if (componentFunction) {
        componentFunction.textContent =
            selected.function;
    }

    if (location) {
        location.textContent =
            selected.location;
    }

    if (tip) {
        tip.textContent =
            selected.tip;
    }

    document.querySelectorAll(".learn-card").forEach(card => {
        const isSelected =
            card.dataset.component === component;

        card.classList.toggle("selected", isSelected);
        card.setAttribute("aria-pressed", String(isSelected));
    });
}


function filterLearnComponents() {

    const search =
        document.getElementById("learn-search");

    const query =
        search ? search.value.trim().toLowerCase() : "";

    const activeFilter =
        document.querySelector(".learn-filter.active");

    const categoryFilter =
        activeFilter ? activeFilter.dataset.learnFilter : "all";

    let visibleCount = 0;

    document.querySelectorAll(".learn-card").forEach(card => {
        const component =
            learnComponentData[card.dataset.component];

        const matchesCategory =
            categoryFilter === "all" ||
            component.category === categoryFilter;

        const matchesSearch =
            (component ? component.title : card.textContent)
                .toLowerCase()
                .includes(query);

        const visible =
            matchesCategory && matchesSearch;

        card.hidden = !visible;

        if (visible) {
            visibleCount++;
        }
    });

    document.querySelectorAll("[data-learn-category]").forEach(grid => {
        const hasVisibleCards =
            Array.from(grid.querySelectorAll(".learn-card"))
                .some(card => !card.hidden);

        grid.hidden = !hasVisibleCards;
    });

    document.querySelectorAll("[data-learn-heading]").forEach(heading => {
        const grid =
            document.querySelector(
                `[data-learn-category="${heading.dataset.learnHeading}"]`
            );

        heading.hidden =
            !grid || grid.hidden;
    });

    const count =
        document.getElementById("learn-results-count");

    if (count) {
        count.textContent =
            `Showing ${visibleCount} of ${document.querySelectorAll(".learn-card").length} components`;
    }
}


function initializeLearnMode() {

    const search =
        document.getElementById("learn-search");

    if (search) {
        search.addEventListener("input", filterLearnComponents);
    }

    document.querySelectorAll(".learn-filter").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".learn-filter").forEach(filter => {
                const selected =
                    filter === button;

                filter.classList.toggle("active", selected);
                filter.setAttribute("aria-pressed", String(selected));
            });

            filterLearnComponents();
        });
    });

    filterLearnComponents();
    showLearnComponent("motherboard");
}


/* =========================================
   TIMER
========================================= */

function stopGameTimer() {

    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}


function startGameTimer() {

    stopGameTimer();

    gameTimeLeft = 300;

    updateGameTimerDisplay();

    gameTimer = setInterval(() => {

        gameTimeLeft--;

        updateGameTimerDisplay();


        if (gameTimeLeft <= 0) {

            stopGameTimer();

            finishGame(
                currentMode === "disassembly" ? "disassembly" : "assembly",
                true
            );
        }

    }, 1000);
}


function updateGameTimerDisplay() {

    const minutes =
        Math.floor(gameTimeLeft / 60);

    const seconds =
        gameTimeLeft % 60;

    const time =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");


    const assemblyTimer =
        document.getElementById("assembly-timer");

    const disassemblyTimer =
        document.getElementById("disassembly-timer");


    if (assemblyTimer) {
        assemblyTimer.textContent = time;
    }

    if (disassemblyTimer) {
        disassemblyTimer.textContent = time;
    }

    const warning =
        gameTimeLeft <= 30;

    [
        "assembly-timer-box",
        "disassembly-timer-box"
    ].forEach(id => {
        const timerBox = document.getElementById(id);

        if (timerBox) {
            timerBox.classList.toggle("timer-warning", warning);
            timerBox.setAttribute(
                "aria-label",
                warning
                    ? `Time running out: ${time} remaining`
                    : `${time} remaining`
            );
        }
    });
}


/* =========================================
   START ASSEMBLY
========================================= */

function startAssembly(
    mode = "practice",
    difficulty = "easy"
) {

    currentMode = "assembly";

    currentDifficulty = difficulty;

    assemblyStep = 0;

    assemblyScore = 0;
    assemblyMistakes = 0;

    draggedComponent = null;
    resetToolEquipment();


    stopGameTimer();


    const game =
        document.getElementById("assembly");

    if (!game) {
        return;
    }


    /*
       Remove previous hard-mode class.
    */

    game.classList.remove("hard-mode");


    if (difficulty === "hard") {
        game.classList.add("hard-mode");
    }


    /*
       Update title.
    */

    const title =
        document.getElementById("assembly-title");

    updateAssemblyBoardImage(0);

    if (title) {

        title.textContent =
            difficulty === "hard"
                ? "ASSEMBLY MODE — HARD"
                : "ASSEMBLY MODE — EASY";
    }


    /*
       Timer visibility.
    */

    const timerBox =
        document.getElementById(
            "assembly-timer-box"
        );

    if (timerBox) {

        timerBox.style.display =
            mode === "challenge"
                ? "inline-block"
                : "none";
    }


    /*
       Reset score.
    */

    updateAssemblyScore();
    updateAssemblyMistakes();


    /*
       Create component buttons.

       HARD MODE IS SCRAMBLED.
    */

    createAssemblyParts();


    /*
       Reset all target zones.
    */

    resetAssemblyTargets();


    /*
       Show assembly screen.
    */

    showScreen("assembly");


    /*
       Start timer only in Challenge.
    */

    if (mode === "challenge") {
        startGameTimer();
    }


    updateAssemblyStep();

    updateAssemblyInstruction();
}


/* =========================================
   CREATE ASSEMBLY COMPONENTS
========================================= */

function createAssemblyParts() {

    const container =
        document.getElementById(
            "assembly-parts"
        );

    if (!container) {
        return;
    }


    container.innerHTML = "";


    let components;


    /*
       EASY:
       Keep the normal order.

       HARD:
       Shuffle every single time.
    */

    if (currentDifficulty === "hard") {

        components =
            shuffleArray(
                assemblyOrder
            );

    } else {

        components =
            [...assemblyOrder];
    }


    components.forEach(component => {

        const data =
            componentInfo[component];

        if (!data) {
            return;
        }


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "part-button";

        button.draggable = true;

        button.dataset.component =
            component;


        const image =
            document.createElement("img");

        image.src = data.image;

        image.alt = "";

        image.draggable = false;


        const label =
            document.createElement("span");

        label.textContent =
            data.name;


        const iconStage =
            document.createElement("span");

        iconStage.className =
            "part-icon-stage";

        iconStage.appendChild(image);

        button.appendChild(iconStage);

        button.appendChild(label);


        /*
           DRAG START
        */

        button.addEventListener(
            "dragstart",
            event => {

                draggedComponent =
                    component;

                button.classList.add(
                    "dragging"
                );


                event.dataTransfer.effectAllowed =
                    "move";

                event.dataTransfer.setData(
                    "text/plain",
                    component
                );


                /*
                   Highlight only the
                   current target in Hard.
                */

                showCurrentAssemblyTarget();
            }
        );


        /*
           DRAG END
        */

        button.addEventListener(
            "dragend",
            () => {

                button.classList.remove(
                    "dragging"
                );

                draggedComponent = null;

                clearTargetHighlights();
            }
        );


        /*
           Prevent normal button
           click behavior.
        */

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                /*
                   Give a small instruction
                   instead of using click
                   as the actual placement.
                */

                const instruction =
                    document.getElementById(
                        "assembly-instruction"
                    );

                if (instruction) {

                    instruction.textContent =
                        "Drag the component into the correct location.";
                }
            }
        );


        container.appendChild(button);
    });
}


/* =========================================
   RESET ASSEMBLY TARGETS
========================================= */

function resetAssemblyTargets() {

    const targets =
        document.querySelectorAll(
            "#assembly .target-zone"
        );


    targets.forEach(target => {

        target.classList.remove(
            "correct"
        );

        target.classList.remove(
            "highlight"
        );

        target.classList.remove(
            "target-hidden"
        );

        target.classList.remove(
            "hard-hover"
        );
    });


    /*
       Install drag/drop listeners.
    */

    setupAssemblyTargets();


    /*
       Only show the first target.
    */

    showCurrentAssemblyTarget();
}


/* =========================================
   SETUP ASSEMBLY DROP TARGETS
========================================= */

function setupAssemblyTargets() {

    const targets =
        document.querySelectorAll(
            "#assembly .target-zone"
        );


    targets.forEach(target => {

        /*
           Avoid duplicate listeners.
        */

        target.ondragover = event => {

            event.preventDefault();

            event.dataTransfer.dropEffect =
                "move";


            /*
               Only the current target
               can highlight.
            */

            const current =
                assemblyOrder[
                    assemblyStep
                ];


            if (
                target.dataset.component ===
                current
            ) {

                target.classList.add(
                    "highlight"
                );

                target.classList.add(
                    "hard-hover"
                );
            }
        };


        target.ondragleave = () => {

            target.classList.remove(
                "highlight"
            );

            target.classList.remove(
                "hard-hover"
            );
        };


        target.ondrop = event => {

            event.preventDefault();

            const component =
                event.dataTransfer.getData(
                    "text/plain"
                ) ||
                draggedComponent;


            target.classList.remove(
                "highlight"
            );

            target.classList.remove(
                "hard-hover"
            );


            handleAssemblyDrop(
                component,
                target
            );
        };
    });
}


/* =========================================
   SHOW CURRENT ASSEMBLY TARGET
========================================= */

function showCurrentAssemblyTarget() {

    const targets =
        document.querySelectorAll(
            "#assembly .target-zone"
        );


    const current =
        assemblyOrder[
            assemblyStep
        ];


    targets.forEach(target => {

        target.classList.remove(
            "highlight"
        );

        target.classList.remove(
            "hard-hover"
        );


        if (
            target.dataset.component ===
            current
        ) {

            /*
               Current target:
               Easy = visible
               Hard = invisible
            */

            target.classList.remove(
                "target-hidden"
            );

        } else {

            /*
               Every other target
               is completely hidden.
            */

            target.classList.add(
                "target-hidden"
            );
        }
    });
}


/* =========================================
   CLEAR TARGET HIGHLIGHTS
========================================= */

function clearTargetHighlights() {

    const targets =
        document.querySelectorAll(
            "#assembly .target-zone"
        );


    targets.forEach(target => {

        target.classList.remove(
            "highlight"
        );

        target.classList.remove(
            "hard-hover"
        );
    });
}


/* =========================================
   HANDLE ASSEMBLY DROP
========================================= */

function handleAssemblyDrop(
    component,
    target
) {

    if (!component) {
        return;
    }


    const expected =
        assemblyOrder[
            assemblyStep
        ];

    if (!hasRequiredTools(expected, "assembly")) {
        return;
    }


    /*
       Wrong component.
    */

    if (
        component !== expected ||
        target.dataset.component !== expected
    ) {

        assemblyMistakes++;
        updateAssemblyMistakes();

        showWrongComponent(
            component
        );

        return;
    }


    /*
       Correct component.
    */

    handleCorrectAssembly(
        component
    );
}


/* =========================================
   CORRECT ASSEMBLY
========================================= */

function handleCorrectAssembly(
    component
) {

    const target =
        document.querySelector(
            `#assembly .target-zone[data-component="${component}"]`
        );

    if (!target) {
        console.error(
            `Cannot install ${component}: its assembly target was not found.`
        );

        return;
    }

    const button =
        document.querySelector(
            `#assembly-parts .part-button[data-component="${component}"]`
        );


    /*
       Score:
       Easy = +50
       Hard = +75
    */

    const points =
        currentDifficulty === "hard"
            ? 75
            : 50;


    assemblyScore += points;


    /*
       Remove component button.
    */

    if (button) {

        button.classList.add(
            "used"
        );
    }


    /*
       Hide target.
    */

    if (target) {

        target.classList.add(
            "correct"
        );
    }


    /*
       Next step.
    */

    assemblyStep++;

    updateAssemblyBoardImage(assemblyStep);

    updateAssemblyScore();

    updateAssemblyStep();
    updateAssemblyInstruction();


    /*
       Finished?
    */

    if (
        assemblyStep >=
        assemblyOrder.length
    ) {

        setTimeout(() => {

            finishGame(
                "assembly"
            );

        }, 400);

        return;
    }


    /*
       Show next target.
    */

    setTimeout(() => {

        showCurrentAssemblyTarget();

    }, 200);
}


function updateAssemblyBoardImage(installedCount) {

    const image =
        document.getElementById(
            currentMode === "disassembly"
                ? "disassembly-board-image"
                : "assembly-board-image"
        );

    if (!image) {
        console.error(
            "Cannot update the motherboard: the board image element was not found."
        );

        return;
    }

    const stateIndex =
        Math.min(
            Math.max(installedCount, 0),
            assemblyStateImages.length - 1
        );

    const source =
        assemblyStateImages[stateIndex];

    if (!source) {
        console.error(
            `Cannot display motherboard state with ${installedCount} installed components.`
        );

        return;
    }

    const installedNames =
        assemblyOrder
            .slice(0, installedCount)
            .map(component => componentInfo[component].name);

    image.alt =
        installedNames.length
            ? `Motherboard with ${installedNames.join(", ")} installed`
            : "Empty motherboard";

    image.classList.remove("board-state-changing");
    void image.offsetWidth;
    image.classList.add("board-state-changing");

    image.onerror = () => {
        console.error(
            `Unable to load motherboard assembly state image: ${source}`
        );
    };

    image.src =
        `assets/images/${source}`;
}


/* =========================================
   WRONG COMPONENT
========================================= */

function showWrongComponent(
    component
) {

    const button =
        document.querySelector(
            `#assembly-parts .part-button[data-component="${component}"]`
        );


    if (!button) {
        return;
    }


    button.classList.remove(
        "wrong"
    );


    /*
       Force animation restart.
    */

    void button.offsetWidth;


    button.classList.add(
        "wrong"
    );


    setTimeout(() => {

        button.classList.remove(
            "wrong"
        );

    }, 400);


    const instruction =
        document.getElementById(
            "assembly-instruction"
        );


    if (instruction) {

        instruction.textContent =
            "Wrong component. Try again.";
    }
}


/* =========================================
   ASSEMBLY UI
========================================= */

function updateAssemblyStep() {

    const element =
        document.getElementById(
            "assembly-step"
        );

    const total =
        document.getElementById(
            "assembly-total"
        );


    if (element) {

        element.textContent =
            Math.min(
                assemblyStep + 1,
                assemblyOrder.length
            );
    }


    if (total) {

        total.textContent =
            assemblyOrder.length;
    }

    updatePartsPanelStep(
        "assembly-panel-step",
        assemblyStep,
        assemblyOrder.length
    );
    highlightNextPart(
        "assembly-parts",
        assemblyOrder[assemblyStep]
    );

    updateChallengeProgress(
        "assembly",
        assemblyStep,
        assemblyOrder.length
    );
}


function updatePartsPanelStep(
    elementId,
    completedSteps,
    totalSteps
) {
    const element =
        document.getElementById(elementId);

    if (!element) {
        return;
    }

    const currentStep =
        Math.min(completedSteps + 1, totalSteps);

    element.textContent =
        `${String(currentStep).padStart(2, "0")} / ${String(totalSteps).padStart(2, "0")}`;
}


function highlightNextPart(
    containerId,
    component
) {
    const container =
        document.getElementById(containerId);

    if (!container) {
        return;
    }

    const assemblyScreen =
        document.getElementById("assembly");

    const hideNextIndicator =
        containerId === "assembly-parts" &&
        assemblyScreen &&
        assemblyScreen.classList.contains("hard-mode");

    container.querySelectorAll(".part-button").forEach(button => {
        const isNext =
            !hideNextIndicator &&
            button.dataset.component === component;

        button.classList.toggle("is-next", isNext);

        if (isNext) {
            button.setAttribute("aria-current", "step");
            button.setAttribute(
                "aria-label",
                `${componentInfo[component].name}, next component`
            );
        } else {
            button.removeAttribute("aria-current");
            button.removeAttribute("aria-label");
        }
    });
}


function updateAssemblyScore() {

    const element =
        document.getElementById(
            "assembly-score"
        );


    if (element) {

        element.textContent =
            assemblyScore;
    }
}


function updateAssemblyInstruction() {

    const instruction =
        document.getElementById(
            "assembly-instruction"
        );

    const tip =
        document.getElementById(
            "assembly-tip"
        );


    if (!instruction) {
        return;
    }


    const current =
        assemblyOrder[
            assemblyStep
        ];


    if (!current) {

        instruction.textContent =
            "Assembly complete!";

        if (tip) {
            tip.textContent =
                "All components are in place. Review your build before moving on.";
        }

        return;
    }


    const data =
        componentInfo[current];


    instruction.textContent =
        currentDifficulty === "hard"
            ? `Step ${assemblyStep + 1}: identify the correct component and place it on the board.`
            : `Step ${assemblyStep + 1}: place the ${data.name} in its highlighted location.`;

    if (tip) {
        tip.textContent =
            componentTips[current].assembly;
    }
}


function updateAssemblyMistakes() {

    const element =
        document.getElementById(
            "assembly-mistakes"
        );

    if (element) {
        element.textContent =
            assemblyMistakes;
    }
}


function updateChallengeProgress(
    gameType,
    completed,
    total
) {

    const progress =
        document.getElementById(
            `${gameType}-progress`
        );

    const label =
        document.getElementById(
            `${gameType}-progress-label`
        );

    const progressBar =
        progress
            ? progress.closest('[role="progressbar"]')
            : null;

    if (!progress || !label || !progressBar) {
        return;
    }

    const percentage =
        total === 0
            ? 0
            : Math.round(completed / total * 100);

    progress.style.width =
        `${percentage}%`;

    progressBar.setAttribute(
        "aria-valuenow",
        completed
    );

    label.textContent =
        `${completed} of ${total} steps complete`;

    progressBar.setAttribute(
        "aria-valuetext",
        label.textContent
    );
}


/* =========================================
   START DISASSEMBLY
========================================= */

function startDisassembly(
    mode = "practice",
    difficulty = "easy"
) {

    currentMode =
        "disassembly";

    currentDifficulty =
        difficulty;

    disassemblyStep = 0;

    disassemblyScore = 0;
    disassemblyMistakes = 0;
    resetToolEquipment();


    stopGameTimer();


    const game =
        document.getElementById(
            "disassembly"
        );

    if (!game) {
        return;
    }

    game.classList.remove("hard-mode");

    if (difficulty === "hard") {
        game.classList.add("hard-mode");
    }

    const title =
        document.getElementById("disassembly-title");

    if (title) {
        title.textContent =
            difficulty === "hard"
                ? "DISASSEMBLY MODE — HARD"
                : "DISASSEMBLY MODE — EASY";
    }

    updateDisassemblyMistakes();
    draggedComponent = null;

    /*
       Timer visibility.
    */

    const timerBox =
        document.getElementById(
            "disassembly-timer-box"
        );

    if (timerBox) {

        timerBox.style.display =
            mode === "challenge"
                ? "inline-block"
                : "none";
    }


    /*
       Create component selection.
    */

    createDisassemblyParts();
    setupDisassemblyTargets();


    updateAssemblyBoardImage(
        assemblyOrder.length
    );


    /*
       Show screen.
    */

    showScreen(
        "disassembly"
    );


    /*
       Start timer for challenge.
    */

    if (mode === "challenge") {

        startGameTimer();
    }


    updateDisassemblyUI();
}


/* =========================================
   CREATE DISASSEMBLY COMPONENTS
========================================= */

function createDisassemblyParts() {

    const container =
        document.getElementById(
            "disassembly-parts"
        );

    if (!container) {
        return;
    }


    container.replaceChildren();
    container.classList.add("empty-drop-zone");

    const emptyState =
        document.createElement("p");

    emptyState.className =
        "parts-empty-state";

    emptyState.textContent =
        "Drag the highlighted component here to remove it.";

    container.appendChild(emptyState);

    container.ondragover = event => {
        const component =
            event.dataTransfer.getData("text/plain") ||
            draggedComponent;

        if (
            currentMode !== "disassembly" ||
            !component
        ) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        container.classList.add("is-drop-target");
    };

    container.ondragleave = event => {
        if (!container.contains(event.relatedTarget)) {
            container.classList.remove("is-drop-target");
        }
    };

    container.ondrop = event => {
        event.preventDefault();
        container.classList.remove("is-drop-target");

        const component =
            event.dataTransfer.getData("text/plain") ||
            draggedComponent;

        handleDisassemblyDrop(component);
    };
}


/* =========================================
   DISASSEMBLY DRAG AND DROP
========================================= */

function setupDisassemblyTargets() {

    document.querySelectorAll(
        "#disassembly .disassembly-target"
    ).forEach(target => {
        target.classList.remove(
            "correct",
            "highlight",
            "current-slot",
            "dragging"
        );

        target.ondragstart = event => {
            const component =
                target.dataset.component;

            if (
                component !== disassemblyOrder[disassemblyStep] ||
                !hasRequiredTools(component, "disassembly")
            ) {
                event.preventDefault();
                return;
            }

            draggedComponent = component;
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData(
                "text/plain",
                component
            );
            target.classList.add("dragging");
        };

        target.ondragend = () => {
            target.classList.remove("dragging");
            draggedComponent = null;
            const partsArea =
                document.getElementById(
                "disassembly-parts"
                );

            if (partsArea) {
                partsArea.classList.remove("is-drop-target");
            }
        };
    });
}


function handleDisassemblyDrop(component) {

    const expected =
        disassemblyOrder[disassemblyStep];

    if (
        currentMode !== "disassembly" ||
        !expected ||
        !component
    ) {
        return;
    }

    if (!hasRequiredTools(expected, "disassembly")) {
        return;
    }

    if (
        component !== expected ||
        draggedComponent !== expected
    ) {
        disassemblyMistakes++;
        updateDisassemblyMistakes();

        updateDisassemblyInstruction(
            "Wrong component or slot. Drag the highlighted component into the parts area."
        );

        return;
    }

    handleCorrectDisassembly(
        component
    );
}


/* =========================================
   CORRECT DISASSEMBLY
========================================= */

function handleCorrectDisassembly(
    component
) {

    const target =
        document.querySelector(
            `#disassembly .disassembly-target[data-component="${component}"]`
        );

    const container =
        document.getElementById(
            "disassembly-parts"
        );

    const data =
        componentInfo[component];

    if (!target || !container || !data) {
        console.error(
            `Cannot remove ${component}: its target, parts area, or component data is missing.`
        );

        return;
    }

    if (
        container.querySelector(
            `.part-button[data-component="${component}"]`
        )
    ) {
        console.error(
            `Cannot remove ${component}: it is already in the parts area.`
        );

        return;
    }

    const points =
        currentDifficulty === "hard"
            ? 75
            : 50;


    const card =
        document.createElement("div");

    card.className =
        "part-button removed-part";

    card.dataset.component =
        component;

    card.setAttribute("role", "listitem");

    const iconStage =
        document.createElement("span");

    iconStage.className =
        "part-icon-stage";

    const image =
        document.createElement("img");

    image.src = data.image;
    image.alt = "";
    image.draggable = false;

    const label =
        document.createElement("span");

    label.textContent =
        data.name;

    iconStage.appendChild(image);
    card.appendChild(iconStage);
    card.appendChild(label);

    container.classList.remove(
        "empty-drop-zone",
        "is-drop-target"
    );

    const emptyState =
        container.querySelector(".parts-empty-state");

    if (emptyState) {
        emptyState.remove();
    }

    container.appendChild(card);

    disassemblyScore += points;
    disassemblyStep++;

    updateAssemblyBoardImage(
        assemblyOrder.length - disassemblyStep
    );

    updateDisassemblyUI();

    const instruction =
        document.getElementById(
            "disassembly-instruction"
        );

    if (instruction) {
        instruction.textContent =
            `Removed ${data.name}. ${instruction.textContent}`;
    }


    /*
       Finished?
    */

    if (
        disassemblyStep >=
        disassemblyOrder.length
    ) {

        setTimeout(() => {

            finishGame(
                "disassembly"
            );

        }, 400);

        return;
    }


    updateDisassemblyInstruction();
}


/* =========================================
   DISASSEMBLY UI
========================================= */

function updateDisassemblyUI() {

    const step =
        document.getElementById(
            "disassembly-step"
        );

    const total =
        document.getElementById(
            "disassembly-total"
        );

    const score =
        document.getElementById(
            "disassembly-score"
        );


    if (step) {

        step.textContent =
            Math.min(
                disassemblyStep + 1,
                disassemblyOrder.length
            );
    }


    if (total) {

        total.textContent =
            disassemblyOrder.length;
    }

    updatePartsPanelStep(
        "disassembly-panel-step",
        disassemblyStep,
        disassemblyOrder.length
    );
    highlightNextPart(
        "disassembly-parts",
        disassemblyOrder[disassemblyStep]
    );


    if (score) {

        score.textContent =
            disassemblyScore;
    }

    updateChallengeProgress(
        "disassembly",
        disassemblyStep,
        disassemblyOrder.length
    );

    updateDisassemblyInstruction();
    showCurrentDisassemblyTarget();
}


function resetToolEquipment() {

    equippedTools.clear();

    document.querySelectorAll(".tool-equip-button").forEach(button => {
        button.onclick = () => {
            const tool = button.dataset.tool;

            if (equippedTools.has(tool)) {
                equippedTools.delete(tool);
            } else {
                equippedTools.add(tool);
            }

            updateToolEquipmentUI();

            if (currentMode === "assembly") {
                updateAssemblyInstruction();
            } else if (currentMode === "disassembly") {
                updateDisassemblyInstruction();
                showCurrentDisassemblyTarget();
            }
        };
    });

    updateToolEquipmentUI();
}


function updateToolEquipmentUI() {

    document.querySelectorAll(".tool-equip-button").forEach(button => {
        const equipped =
            equippedTools.has(button.dataset.tool);

        button.classList.toggle("equipped", equipped);
        button.setAttribute("aria-pressed", String(equipped));
        button.querySelector("span").textContent =
            `${equipped ? "Unequip" : "Equip"} ${button.dataset.tool === "screwdriver" ? "Screwdriver" : "Wrist Strap"}`;
    });

    const equippedNames = [];

    if (equippedTools.has("esd-wrist-strap")) {
        equippedNames.push("Wrist Strap");
    }

    if (equippedTools.has("screwdriver")) {
        equippedNames.push("Screwdriver");
    }

    const status =
        equippedNames.length
            ? `Equipped: ${equippedNames.join(" and ")}.`
            : "No tools equipped.";

    document.querySelectorAll(".tool-status").forEach(element => {
        element.textContent = status;
    });
}


function hasRequiredTools(component, action) {

    const instruction =
        document.getElementById(
            action === "assembly"
                ? "assembly-instruction"
                : "disassembly-instruction"
        );

    if (!equippedTools.has("esd-wrist-strap")) {
        if (instruction) {
            instruction.textContent =
                "Equip the ESD wrist strap before handling components.";
        }

        return false;
    }

    if (
        screwdriverRequiredComponents.has(component) &&
        !equippedTools.has("screwdriver")
    ) {
        if (instruction) {
            instruction.textContent =
                component === "m2-ssd"
                    ? "Equip the screwdriver to secure or remove the M.2 SSD retaining screw."
                    : `Equip the screwdriver before ${action === "assembly" ? "installing" : "removing"} screws.`;
        }

        return false;
    }

    if (
        !screwdriverRequiredComponents.has(component) &&
        equippedTools.has("screwdriver")
    ) {
        if (instruction) {
            instruction.textContent =
                "Unequip the screwdriver before handling other components.";
        }

        return false;
    }

    return true;
}

function hasCorrectToolsEquipped(component) {
    return (
        equippedTools.has("esd-wrist-strap") &&
        screwdriverRequiredComponents.has(component) ===
            equippedTools.has("screwdriver")
    );
}


function showCurrentDisassemblyTarget() {

    const current =
        disassemblyOrder[disassemblyStep];

    document.querySelectorAll(
        "#disassembly .disassembly-target"
    ).forEach(target => {
        const isCurrent =
            target.dataset.component === current;

        target.classList.toggle("target-hidden", !isCurrent);
        target.classList.toggle("current-slot", isCurrent);
        target.setAttribute(
            "aria-hidden",
            String(!isCurrent)
        );
        target.draggable =
            isCurrent &&
            hasCorrectToolsEquipped(current);
    });
}


function updateDisassemblyInstruction(
    message = null
) {

    const instruction =
        document.getElementById(
            "disassembly-instruction"
        );

    const tip =
        document.getElementById(
            "disassembly-tip"
        );


    if (!instruction) {
        return;
    }


    if (message) {

        instruction.textContent =
            message;

        return;
    }


    const current =
        disassemblyOrder[
            disassemblyStep
        ];


    if (!current) {

        instruction.textContent =
            "Disassembly complete!";

        if (tip) {
            tip.textContent =
                "The board is clear. Handle each part carefully and keep small pieces together.";
        }

        return;
    }


    const data =
        componentInfo[current];

    if (!equippedTools.has("esd-wrist-strap")) {
        instruction.textContent =
            "Equip the ESD wrist strap before handling components.";
        return;
    }

    if (
        screwdriverRequiredComponents.has(current) &&
        !equippedTools.has("screwdriver")
    ) {
        instruction.textContent =
            current === "m2-ssd"
                ? "Equip the screwdriver before removing the M.2 SSD."
                : "Equip the screwdriver before removing screws.";
        return;
    }

    if (
        !screwdriverRequiredComponents.has(current) &&
        equippedTools.has("screwdriver")
    ) {
        instruction.textContent =
            "Unequip the screwdriver before handling other components.";
        return;
    }


    instruction.textContent =
        `Step ${disassemblyStep + 1}: drag the ${data.name} from its highlighted motherboard slot into the parts area.`;

    if (tip) {
        tip.textContent =
            componentTips[current].disassembly;
    }
}


function updateDisassemblyMistakes() {

    const element =
        document.getElementById(
            "disassembly-mistakes"
        );

    if (element) {
        element.textContent =
            disassemblyMistakes;
    }
}


/* =========================================
   CHALLENGE MODE
========================================= */

function selectChallengeDifficulty(difficulty) {
    challengeDifficulty = difficulty;
    showScreen("challenge-mode-selection");
}


function startChallenge(gameMode) {
    if (gameMode === "disassembly") {
        startDisassembly(
            "challenge",
            challengeDifficulty
        );

        return;
    }

    startAssembly(
        "challenge",
        challengeDifficulty
    );
}


/* =========================================
   FINISH ASSEMBLY / DISASSEMBLY
========================================= */

function finishGame(
    gameType,
    timeUp = false
) {

    stopGameTimer();


    if (gameType === "assembly") {

        setResultValues(
            timeUp
                ? "TIME UP — ASSEMBLY"
                : "ASSEMBLY COMPLETE!",
            assemblyScore,
            assemblyStep,
            assemblyOrder.length,
            assemblyMistakes
        );

    } else {

        setResultValues(
            timeUp
                ? "TIME UP — DISASSEMBLY"
                : "DISASSEMBLY COMPLETE!",
            disassemblyScore,
            disassemblyStep,
            disassemblyOrder.length,
            disassemblyMistakes
        );
    }


    showScreen(
        "results"
    );
}


/* =========================================
   RESULTS
========================================= */

function setResultValues(
    title,
    score,
    correct,
    total,
    mistakes = Math.max(total - correct, 0)
) {

    const titleElement =
        document.getElementById(
            "result-title"
        );

    const scoreElement =
        document.getElementById(
            "final-score"
        );

    const correctElement =
        document.getElementById(
            "final-correct"
        );

    const mistakesElement =
        document.getElementById(
            "final-mistakes"
        );


    if (titleElement) {
        titleElement.textContent =
            title;
    }


    if (scoreElement) {
        scoreElement.textContent =
            score;
    }


    if (correctElement) {
        correctElement.textContent =
            correct;
    }


    if (mistakesElement) {

        mistakesElement.textContent = mistakes;
    }
}


/* =========================================
   LEAVE GAME
========================================= */

function leaveGame() {

    stopGameTimer();

    stopQuizTimer();

    draggedComponent = null;


    showScreen(
        "mode-selection"
    );
}


/* =========================================
   RESET GAME
========================================= */

function resetGame() {

    stopGameTimer();

    stopQuizTimer();


    assemblyStep = 0;

    assemblyScore = 0;

    disassemblyStep = 0;

    disassemblyScore = 0;

    quizScore = 0;

    quizCorrect = 0;

    quizMistakes = 0;

    quizCurrentQuestion = 0;


    updateAssemblyScore();

    updateDisassemblyUI();
}


/* =========================================
   QUIZ QUESTIONS
========================================= */

const quizQuestions = [

    {
        type: "mc",
        question:
            "Which component is responsible for executing instructions?",
        options: [
            "CPU",
            "RAM",
            "PSU",
            "SSD"
        ],
        answer: "CPU",
        explanation: "The CPU executes program instructions and performs calculations. RAM, storage, and the PSU each have different jobs."
    },

    {
        type: "mc",
        question:
            "Which component provides power to the computer?",
        options: [
            "PSU",
            "GPU",
            "RAM",
            "CPU"
        ],
        answer: "PSU",
        explanation: "The power supply unit (PSU) converts power from the outlet into power the computer components can use."
    },

    {
        type: "mc",
        question:
            "Which component temporarily stores data being actively used?",
        options: [
            "RAM",
            "SSD",
            "PSU",
            "GPU"
        ],
        answer: "RAM",
        explanation: "RAM temporarily holds data and instructions that are in use. Its contents are cleared when power is turned off."
    },

    {
        type: "mc",
        question:
            "Which component is mainly responsible for processing graphics?",
        options: [
            "GPU",
            "CPU",
            "PSU",
            "SSD"
        ],
        answer: "GPU",
        explanation: "The GPU processes graphics and other parallel visual workloads; it does not primarily provide power or store files."
    },

    {
        type: "mc",
        question:
            "What connects the main power supply to the motherboard?",
        options: [
            "24-Pin Cable",
            "SATA Data Cable",
            "8-Pin CPU Cable",
            "Front Panel Cable"
        ],
        answer: "24-Pin Cable",
        explanation: "The 24-pin connector is the motherboard's main power connection from the PSU."
    },

    {
        type: "mc",
        question:
            "Which cable provides CPU power near the processor?",
        options: [
            "8-Pin CPU Cable",
            "24-Pin Cable",
            "SATA Data Cable",
            "Front Panel Cable"
        ],
        answer: "8-Pin CPU Cable",
        explanation: "The 8-pin CPU power lead connects the PSU to the motherboard power input near the processor."
    },

    {
        type: "mc",
        question:
            "What does thermal paste help transfer?",
        options: [
            "Heat",
            "Electricity",
            "Storage data",
            "Network signals"
        ],
        answer: "Heat",
        explanation: "Thermal paste fills tiny gaps between the CPU and cooler so heat transfers more effectively to the cooler."
    },

    {
        type: "mc",
        question:
            "Which device is designed primarily for long-term data storage?",
        options: [
            "SSD",
            "RAM",
            "CPU",
            "Cooler"
        ],
        answer: "SSD",
        explanation: "An SSD keeps files when the computer is off. RAM is temporary working memory, not long-term storage."
    },

    {
        type: "mc",
        question:
            "Which cable connects compatible storage to the motherboard?",
        options: [
            "SATA Data Cable",
            "24-Pin Cable",
            "8-Pin Cable",
            "Front Panel Cable"
        ],
        answer: "SATA Data Cable",
        explanation: "A SATA data cable carries information between a compatible storage drive and the motherboard."
    },

    {
        type: "mc",
        question:
            "What helps keep the CPU from overheating?",
        options: [
            "CPU Cooler",
            "RAM",
            "SSD",
            "Front Panel"
        ],
        answer: "CPU Cooler",
        explanation: "A CPU cooler moves heat away from the processor to help keep it within a safe operating temperature."
    },

    {
        type: "mc",
        question:
            "What is the main circuit board of a computer?",
        options: [
            "Motherboard",
            "GPU",
            "PSU",
            "SSD"
        ],
        answer: "Motherboard",
        explanation: "The motherboard provides connections that let the CPU, memory, storage, and other components communicate."
    },

    {
        type: "mc",
        question:
            "What is the purpose of a case fan?",
        options: [
            "Move air through the case",
            "Store files",
            "Process instructions",
            "Supply motherboard power"
        ],
        answer: "Move air through the case",
        explanation: "Case fans move air through the chassis, helping bring cool air in and remove warm air."
    },

    {
        type: "mc",
        question:
            "Which tool is commonly used to secure computer screws?",
        options: [
            "Screwdriver",
            "RAM",
            "CPU",
            "SATA Cable"
        ],
        answer: "Screwdriver",
        explanation: "A correctly sized screwdriver is used to install and remove many computer case and component screws."
    },

    {
        type: "mc",
        question:
            "Which component stores files without requiring constant power?",
        options: [
            "SSD",
            "RAM",
            "CPU",
            "Cooler"
        ],
        answer: "SSD",
        explanation: "An SSD is non-volatile storage, so it retains files without continuous power. RAM does not."
    },

    {
        type: "mc",
        question:
            "What do front-panel connectors usually connect?",
        options: [
            "Case buttons and indicators",
            "CPU cores",
            "RAM chips",
            "GPU fans"
        ],
        answer: "Case buttons and indicators",
        explanation: "Front-panel leads connect case controls and status lights, such as the power button and activity LED, to the motherboard."
    },

    {
        type: "tf",
        question:
            "RAM is used for temporary working data.",
        answer: true,
        explanation: "RAM is working memory that temporarily holds the data and instructions currently needed by the CPU."
    },

    {
        type: "tf",
        question:
            "The CPU is primarily responsible for executing instructions.",
        answer: true,
        explanation: "The CPU fetches and executes instructions, making it the computer's primary general-purpose processor."
    },

    {
        type: "tf",
        question:
            "An SSD is normally used as temporary working memory.",
        answer: false,
        explanation: "An SSD stores files long term. RAM is the temporary working memory used while programs are running."
    },

    {
        type: "tf",
        question:
            "Thermal paste helps transfer heat between the CPU and cooler.",
        answer: true,
        explanation: "Thermal paste improves heat transfer across the small surface gaps between the CPU and its cooler."
    },

    {
        type: "tf",
        question:
            "The PSU supplies electrical power to computer components.",
        answer: true,
        explanation: "The PSU supplies electrical power to the motherboard and other components through the appropriate power leads."
    },

    {
        type: "tf",
        question:
            "A GPU is mainly designed to store user documents.",
        answer: false,
        explanation: "A GPU processes graphics and visual workloads. Long-term document storage belongs on an SSD or HDD."
    },

    {
        type: "tf",
        question:
            "A SATA data cable can connect compatible storage to a motherboard.",
        answer: true,
        explanation: "A SATA data cable carries data between a compatible drive and a SATA port on the motherboard."
    },

    {
        type: "tf",
        question:
            "A CPU cooler is designed to increase CPU temperature.",
        answer: false,
        explanation: "A CPU cooler removes heat from the processor; it is not designed to increase the CPU's temperature."
    },

    {
        type: "tf",
        question:
            "The motherboard connects many of the major computer components.",
        answer: true,
        explanation: "The motherboard is the main board that provides connections for many of the computer's major components."
    },

    {
        type: "tf",
        question:
            "A screwdriver is commonly used to install computer screws.",
        answer: true,
        explanation: "A screwdriver is commonly used to install or remove the screws that secure computer hardware."
    },

    {
        type: "mc",
        question: "Which component holds the CPU, memory, and expansion slots?",
        options: ["Motherboard", "Power supply", "Case fan", "SSD"],
        answer: "Motherboard",
        explanation: "The motherboard is the main circuit board and provides sockets and slots for components such as the CPU and RAM."
    },
    {
        type: "mc",
        question: "What does HDD stand for?",
        options: ["Hard Disk Drive", "High Data Device", "Hardware Drive Dock", "Heat Distribution Diode"],
        answer: "Hard Disk Drive",
        explanation: "HDD means Hard Disk Drive. It stores data magnetically on spinning platters."
    },
    {
        type: "mc",
        question: "Which storage device has no spinning platters?",
        options: ["SSD", "HDD", "Optical disc drive", "Case fan"],
        answer: "SSD",
        explanation: "A solid-state drive (SSD) uses flash memory and has no spinning platters or moving read/write heads."
    },
    {
        type: "mc",
        question: "Which part of the motherboard holds the processor?",
        options: ["CPU socket", "SATA port", "Fan header", "Memory slot"],
        answer: "CPU socket",
        explanation: "The CPU socket is the motherboard connection designed to hold and electrically connect the processor."
    },
    {
        type: "mc",
        question: "What should you do before working inside a desktop PC?",
        options: ["Shut it down and disconnect power", "Leave it running", "Remove the CPU cooler first", "Unplug the monitor only"],
        answer: "Shut it down and disconnect power",
        explanation: "Power the computer off and disconnect it from the outlet before working inside to reduce electrical and component-damage risks."
    },
    {
        type: "mc",
        question: "What is the safest way to handle a processor?",
        options: ["Hold it by the edges", "Touch the contacts", "Place it on carpet", "Press hard into the socket"],
        answer: "Hold it by the edges",
        explanation: "Holding a CPU by its edges helps avoid contaminating or damaging its delicate contacts and reduces static risk."
    },
    {
        type: "mc",
        question: "What should you do if a CPU does not sit easily in its socket?",
        options: ["Check alignment and never force it", "Push harder", "Use a screwdriver to press it down", "Apply thermal paste underneath"],
        answer: "Check alignment and never force it",
        explanation: "Processors have alignment markers and must fit correctly. Forcing one can bend contacts or damage the socket."
    },
    {
        type: "mc",
        question: "Why must the notch on a RAM module line up with its slot?",
        options: ["To ensure correct orientation", "To increase its storage capacity", "To power the CPU", "To connect the monitor"],
        answer: "To ensure correct orientation",
        explanation: "The notch prevents a RAM module from being installed backward. Align it before applying even pressure."
    },
    {
        type: "mc",
        question: "Which connector commonly powers a SATA hard drive?",
        options: ["SATA power connector", "Front-panel connector", "CPU fan header", "DisplayPort connector"],
        answer: "SATA power connector",
        explanation: "A SATA drive typically needs a SATA power lead from the PSU; its separate SATA data cable connects to the motherboard."
    },
    {
        type: "mc",
        question: "What is the purpose of a motherboard fan header?",
        options: ["Connect and control a fan", "Store files", "Hold the CPU", "Supply power to the wall outlet"],
        answer: "Connect and control a fan",
        explanation: "Fan headers provide power and control signals for compatible CPU or case fans."
    },
    {
        type: "mc",
        question: "Which small motherboard battery helps maintain the clock and firmware settings?",
        options: ["CMOS battery", "GPU battery", "RAM cell", "SSD cell"],
        answer: "CMOS battery",
        explanation: "The CMOS battery provides standby power for the real-time clock and helps retain firmware settings when the PC is unplugged."
    },
    {
        type: "mc",
        question: "What does ESD mean in computer hardware safety?",
        options: ["Electrostatic discharge", "Electronic storage device", "Energy supply detector", "External system drive"],
        answer: "Electrostatic discharge",
        explanation: "ESD is electrostatic discharge: a sudden transfer of static electricity that can damage sensitive electronic components."
    },
    {
        type: "mc",
        question: "How should you tighten motherboard screws?",
        options: ["Snugly, without overtightening", "As hard as possible", "Only halfway in", "With glue instead"],
        answer: "Snugly, without overtightening",
        explanation: "Tighten screws enough to secure the board, but do not overtighten; excessive force can damage the board or threads."
    },
    {
        type: "mc",
        question: "What is the main purpose of a graphics card?",
        options: ["Process graphics and send display output", "Store the operating system", "Power every component", "Cool the CPU"],
        answer: "Process graphics and send display output",
        explanation: "A graphics card's GPU processes visual workloads and the card provides display connections."
    },
    {
        type: "mc",
        question: "What is the function of the PC case?",
        options: ["House and protect components", "Execute all instructions", "Store temporary memory", "Convert AC power to DC"],
        answer: "House and protect components",
        explanation: "The case supports and protects components while providing airflow and mounting locations."
    },
    {
        type: "mc",
        question: "Which cable connects case power-button pins to the motherboard?",
        options: ["Front-panel lead", "SATA data cable", "24-pin power lead", "GPU power lead"],
        answer: "Front-panel lead",
        explanation: "The case's front-panel lead connects its power switch and indicator lights to the motherboard's front-panel header."
    },
    {
        type: "mc",
        question: "Which statement about RAM is correct?",
        options: ["It is volatile working memory", "It keeps files after power is removed", "It supplies power to the board", "It cools the graphics card"],
        answer: "It is volatile working memory",
        explanation: "RAM is volatile memory: it provides fast working space while powered, but does not retain data after shutdown."
    },
    {
        type: "mc",
        question: "Why is airflow important inside a computer case?",
        options: ["It helps remove heat", "It stores more files", "It increases RAM capacity", "It connects the CPU to the socket"],
        answer: "It helps remove heat",
        explanation: "Airflow carries heat away from components, helping them stay within safe operating temperatures."
    },
    {
        type: "mc",
        question: "Where should you apply thermal paste?",
        options: ["Between the CPU and cooler contact surfaces", "Inside the CPU socket", "On RAM contacts", "On the PSU power plug"],
        answer: "Between the CPU and cooler contact surfaces",
        explanation: "Thermal paste belongs between the CPU's heat spreader and the cooler base. Keep it out of sockets and connectors."
    },
    {
        type: "mc",
        question: "What should you check before connecting a power cable?",
        options: ["That the connector and header match", "That the PC is inside a carpet", "That every cable is the same shape", "That the CPU is removed"],
        answer: "That the connector and header match",
        explanation: "Connect only compatible, correctly oriented plugs to their matching headers. Never force a connector."
    },
    {
        type: "tf",
        question: "An HDD stores data on spinning magnetic platters.",
        answer: true,
        explanation: "A traditional hard disk drive stores data magnetically on spinning platters and uses moving read/write heads."
    },
    {
        type: "tf",
        question: "An SSD needs spinning platters to read files.",
        answer: false,
        explanation: "SSDs use flash memory and have no spinning platters; spinning magnetic platters are used by traditional HDDs."
    },
    {
        type: "tf",
        question: "A desktop computer should be disconnected from power before installing internal components.",
        answer: true,
        explanation: "Shut down and unplug the PC before installing components to reduce electrical hazards and accidental damage."
    },
    {
        type: "tf",
        question: "It is safe to force a misaligned CPU into its socket.",
        answer: false,
        explanation: "Never force a CPU into its socket. Recheck the alignment markers because pressure can damage the CPU or socket."
    },
    {
        type: "tf",
        question: "The notch on a RAM module helps orient it correctly.",
        answer: true,
        explanation: "The notch lines up with a key in the memory slot so the module can be installed in the correct orientation."
    },
    {
        type: "tf",
        question: "A SATA data cable and SATA power cable perform the same job.",
        answer: false,
        explanation: "The SATA data cable carries information to the motherboard; the SATA power cable supplies electrical power from the PSU."
    },
    {
        type: "tf",
        question: "A case fan can help move warm air out of the chassis.",
        answer: true,
        explanation: "Case fans support airflow by moving cool air in and warm air out of the computer chassis."
    },
    {
        type: "tf",
        question: "The 24-pin motherboard cable is the main motherboard power connector.",
        answer: true,
        explanation: "The 24-pin PSU lead supplies the motherboard's main power connection."
    },
    {
        type: "tf",
        question: "The CPU cooler should be firmly attached for effective heat transfer.",
        answer: true,
        explanation: "A securely mounted cooler maintains good contact with the CPU so it can transfer heat effectively."
    },
    {
        type: "tf",
        question: "Front-panel connectors are used to attach case buttons and indicators to the motherboard.",
        answer: true,
        explanation: "Front-panel leads connect case controls and indicator lights to the motherboard header."
    },
    {
        type: "tf",
        question: "An ESD wrist strap can help reduce static-discharge risk when handling components.",
        answer: true,
        explanation: "A properly used ESD wrist strap helps equalize electrical potential and reduce static discharge risk."
    },
    {
        type: "tf",
        question: "The PSU is responsible for executing application instructions.",
        answer: false,
        explanation: "The CPU executes instructions. The PSU's job is to provide electrical power to the computer."
    },
    {
        type: "tf",
        question: "RAM normally retains its contents after the computer is powered off.",
        answer: false,
        explanation: "RAM is volatile, so its contents are lost when power is removed. Persistent files are stored on an SSD or HDD."
    },
    {
        type: "tf",
        question: "The motherboard connects and allows communication between many computer components.",
        answer: true,
        explanation: "The motherboard provides electrical connections and communication paths for the CPU, memory, storage, and peripherals."
    },
    {
        type: "tf",
        question: "A CPU cooler is installed to add heat to the processor.",
        answer: false,
        explanation: "A CPU cooler removes heat from the processor; it does not add heat."
    },
    {
        type: "mc",
        question: "What is the purpose of motherboard standoffs?",
        options: ["Keep the motherboard from touching the case directly", "Attach the CPU cooler fan blades", "Connect the case buttons", "Hold the graphics card fans"],
        answer: "Keep the motherboard from touching the case directly",
        explanation: "Standoffs support the motherboard above the case tray and help prevent electrical shorts."
    },
    {
        type: "mc",
        question: "Where can you find the correct front-panel pin layout for a motherboard?",
        options: ["The motherboard manual", "The monitor manual", "The case fan label", "The SSD packaging only"],
        answer: "The motherboard manual",
        explanation: "Motherboard manuals identify the front-panel header pins and their functions."
    },
    {
        type: "mc",
        question: "What does POST refer to when a computer starts?",
        options: ["Power-On Self-Test", "Peripheral Output Signal Transfer", "Processor Operating Speed Test", "Power Outlet Safety Timer"],
        answer: "Power-On Self-Test",
        explanation: "POST is the startup check that firmware performs to initialize and check essential hardware."
    },
    {
        type: "mc",
        question: "What is UEFI firmware responsible for?",
        options: ["Initializing hardware and starting the boot process", "Cooling the CPU", "Storing files permanently", "Displaying images on the monitor by itself"],
        answer: "Initializing hardware and starting the boot process",
        explanation: "UEFI initializes system hardware and helps load the operating system during startup."
    },
    {
        type: "mc",
        question: "What is a boot drive?",
        options: ["A drive containing the operating system used to start the computer", "A fan that starts before other fans", "The cable that powers the motherboard", "A special type of RAM slot"],
        answer: "A drive containing the operating system used to start the computer",
        explanation: "The boot drive holds the operating system or boot files the computer loads when it starts."
    },
    {
        type: "mc",
        question: "Which motherboard slot is commonly used for a graphics card?",
        options: ["PCIe x16 slot", "DIMM slot", "SATA port", "M.2 screw hole"],
        answer: "PCIe x16 slot",
        explanation: "A graphics card is commonly installed in a full-length PCI Express x16 slot."
    },
    {
        type: "mc",
        question: "What kind of component is installed in a DIMM slot?",
        options: ["Desktop memory module", "SATA drive", "Power supply", "Case fan"],
        answer: "Desktop memory module",
        explanation: "DIMM slots are designed for desktop RAM modules."
    },
    {
        type: "mc",
        question: "What should you check before buying RAM for a motherboard?",
        options: ["Supported memory type and capacity in the motherboard specifications", "The monitor's refresh rate", "The case's number of USB ports only", "The SSD's brand"],
        answer: "Supported memory type and capacity in the motherboard specifications",
        explanation: "The motherboard specifications list supported memory generations, capacities, and configurations."
    },
    {
        type: "mc",
        question: "What does dual-channel memory describe?",
        options: ["A memory configuration that uses two memory channels", "Two separate operating systems", "Two storage drives connected by one cable", "A RAM module with two cooling fans"],
        answer: "A memory configuration that uses two memory channels",
        explanation: "Dual-channel memory uses two memory channels; consult the motherboard manual for the recommended slot pair."
    },
    {
        type: "mc",
        question: "How can you identify which memory slots to use for a two-module kit?",
        options: ["Check the motherboard manual", "Always choose the two slots nearest the CPU", "Use the slots with matching colors without checking", "Choose slots connected to the graphics card"],
        answer: "Check the motherboard manual",
        explanation: "Slot recommendations vary by board, so the manual is the reliable source for a two-module configuration."
    },
    {
        type: "mc",
        question: "What is one key difference between NVMe and SATA SSDs?",
        options: ["NVMe uses the PCIe interface, while SATA uses the SATA interface", "NVMe requires spinning platters", "SATA SSDs cannot store files", "NVMe is a type of case fan"],
        answer: "NVMe uses the PCIe interface, while SATA uses the SATA interface",
        explanation: "NVMe SSDs communicate over PCIe, while SATA SSDs use the SATA storage interface."
    },
    {
        type: "mc",
        question: "Does every M.2 drive necessarily use NVMe?",
        options: ["No; M.2 drives can use SATA or NVMe", "Yes; M.2 always means NVMe", "No; M.2 is only a memory module", "Yes; M.2 drives are all hard disks"],
        answer: "No; M.2 drives can use SATA or NVMe",
        explanation: "M.2 describes a form factor; an M.2 drive may use SATA or PCIe/NVMe, depending on the drive and board."
    },
    {
        type: "mc",
        question: "What should you verify before installing an M.2 SSD?",
        options: ["That the motherboard slot supports the drive's interface and size", "That the case has a front-panel speaker", "That the PSU is modular", "That the monitor is turned on"],
        answer: "That the motherboard slot supports the drive's interface and size",
        explanation: "M.2 slots vary in supported interfaces and drive lengths; check the motherboard manual before installation."
    },
    {
        type: "mc",
        question: "What is the purpose of an M.2 standoff and retaining screw?",
        options: ["Support and secure the end of an M.2 drive", "Connect the drive to a SATA data cable", "Attach the CPU to its socket", "Ground the case fan"],
        answer: "Support and secure the end of an M.2 drive",
        explanation: "The standoff supports the drive at the correct length, and the screw holds it in place."
    },
    {
        type: "mc",
        question: "What should you do with a protective film on an M.2 heatsink thermal pad before installation?",
        options: ["Remove the film so the pad can contact the drive", "Leave it between the pad and drive", "Apply it to the CPU socket", "Fold it under the motherboard"],
        answer: "Remove the film so the pad can contact the drive",
        explanation: "A protective film left on the thermal pad prevents proper contact and heat transfer."
    },
    {
        type: "mc",
        question: "Which cable carries data between a SATA drive and the motherboard?",
        options: ["SATA data cable", "SATA power cable", "CPU EPS cable", "Front-panel switch lead"],
        answer: "SATA data cable",
        explanation: "A SATA data cable connects the drive to a motherboard SATA port; the drive also needs power."
    },
    {
        type: "mc",
        question: "What does a modular power supply let you do?",
        options: ["Connect only the PSU cables needed for the build", "Add more CPU cores", "Change the motherboard socket", "Increase the number of RAM slots"],
        answer: "Connect only the PSU cables needed for the build",
        explanation: "A modular PSU has detachable cables, allowing builders to connect only the leads their components require."
    },
    {
        type: "mc",
        question: "Why should you use only the cables supplied or approved for your exact PSU model?",
        options: ["PSU-side cable pinouts can differ and incompatible cables can damage hardware", "All PSU cables are too short otherwise", "Other cables prevent the case fan from spinning", "It changes the computer's memory type"],
        answer: "PSU-side cable pinouts can differ and incompatible cables can damage hardware",
        explanation: "Modular PSU cables are not universally interchangeable; verify compatibility with the PSU manufacturer."
    },
    {
        type: "mc",
        question: "What does an 80 PLUS rating indicate about a power supply?",
        options: ["A level of power-conversion efficiency under specified conditions", "The number of cables included", "The maximum number of hard drives", "That the PSU is safe to open"],
        answer: "A level of power-conversion efficiency under specified conditions",
        explanation: "80 PLUS is an efficiency certification; it does not mean the PSU should be opened or guarantee every aspect of quality."
    },
    {
        type: "mc",
        question: "What is a practical way to choose a PSU wattage?",
        options: ["Check the power needs of the components and allow suitable headroom", "Choose the lowest wattage available", "Match the wattage to the case fan count only", "Use the monitor's wattage as the total"],
        answer: "Check the power needs of the components and allow suitable headroom",
        explanation: "Estimate the system's load using component recommendations and leave appropriate capacity for stable operation and upgrades."
    },
    {
        type: "mc",
        question: "What is the safest response if a PSU makes a burning smell?",
        options: ["Switch off and disconnect power, then stop using it", "Open the PSU while it is plugged in", "Pour water into the PSU", "Keep running it to see if the smell stops"],
        answer: "Switch off and disconnect power, then stop using it",
        explanation: "A burning smell may indicate a fault. Disconnect power and have the PSU inspected or replaced; do not open it."
    },
    {
        type: "mc",
        question: "Why should you never open a power supply unit?",
        options: ["It can contain dangerous stored electrical charge", "It will erase the SSD", "It changes the CPU socket type", "It makes the case too hot to touch"],
        answer: "It can contain dangerous stored electrical charge",
        explanation: "PSUs can retain hazardous voltages even after being unplugged and should be serviced by qualified professionals."
    },
    {
        type: "mc",
        question: "Where should a discrete graphics card's monitor cable usually be connected?",
        options: ["To a video output on the graphics card", "To a USB port on the case", "To the motherboard audio jack", "To the PSU power switch"],
        answer: "To a video output on the graphics card",
        explanation: "When using a discrete graphics card, connect the display to the card's video output."
    },
    {
        type: "mc",
        question: "What is a display connector such as HDMI or DisplayPort used for?",
        options: ["Sending video, and often audio, to a display", "Supplying power to the CPU socket", "Connecting RAM to the motherboard", "Transferring files to a SATA SSD"],
        answer: "Sending video, and often audio, to a display",
        explanation: "HDMI and DisplayPort carry digital display signals and can also carry audio."
    },
    {
        type: "mc",
        question: "What is integrated graphics?",
        options: ["Graphics processing built into a CPU or other main processor", "A graphics card installed in a SATA port", "A type of power supply cable", "A fan built into the monitor stand"],
        answer: "Graphics processing built into a CPU or other main processor",
        explanation: "Integrated graphics is built into a processor or system-on-chip rather than being a separate graphics card."
    },
    {
        type: "mc",
        question: "Will every CPU provide usable integrated graphics?",
        options: ["No; check the exact CPU specifications", "Yes; every CPU includes display outputs", "No; integrated graphics is part of the PSU", "Yes; any CPU can use the graphics card's ports without a graphics card"],
        answer: "No; check the exact CPU specifications",
        explanation: "Some CPUs do not include enabled integrated graphics, so check the processor specifications before relying on it."
    },
    {
        type: "mc",
        question: "What does a motherboard chipset help manage?",
        options: ["Communication and features supported by the platform", "Air pressure inside the CPU cooler", "The monitor's screen brightness only", "The mechanical rotation of HDD platters"],
        answer: "Communication and features supported by the platform",
        explanation: "The chipset provides platform I/O capabilities and helps determine motherboard features and compatibility."
    },
    {
        type: "mc",
        question: "What should you check to confirm a motherboard fits a computer case?",
        options: ["Compatible motherboard form factors", "The color of the RAM heat spreader", "The CPU fan's cable length only", "The SSD's storage capacity"],
        answer: "Compatible motherboard form factors",
        explanation: "Cases support specific motherboard form factors, such as ATX or microATX; confirm compatibility before building."
    },
    {
        type: "mc",
        question: "What is the main purpose of a case dust filter?",
        options: ["Reduce dust entering the case through filtered airflow openings", "Increase the processor clock speed", "Hold the CPU in its socket", "Store the computer's firmware"],
        answer: "Reduce dust entering the case through filtered airflow openings",
        explanation: "Dust filters trap some airborne dust while allowing air to pass and should be cleaned periodically."
    },
    {
        type: "mc",
        question: "What is a common approach to case airflow?",
        options: ["Bring cool air in and exhaust warm air out", "Block every vent to keep dust out", "Point all fans at the motherboard tray", "Use fans only when the computer is off"],
        answer: "Bring cool air in and exhaust warm air out",
        explanation: "A planned intake-to-exhaust path helps move heat out of the case; fan placement depends on the case and components."
    },
    {
        type: "mc",
        question: "What should you do before cleaning dust from a computer?",
        options: ["Shut it down and disconnect it from power", "Leave it running at full load", "Remove the motherboard while it is plugged in", "Spray liquid cleaner directly on the components"],
        answer: "Shut it down and disconnect it from power",
        explanation: "Turn off and unplug the computer before cleaning; avoid liquids and follow safe handling guidance."
    },
    {
        type: "mc",
        question: "When using compressed air to clean a fan, why should you keep the fan from spinning freely?",
        options: ["Overspinning can damage the fan or connected electronics", "The fan stores the BIOS settings", "It prevents the CPU from fitting", "It makes the compressed air warmer"],
        answer: "Overspinning can damage the fan or connected electronics",
        explanation: "Hold the fan blades still while cleaning so the air does not drive them to excessive speeds."
    },
    {
        type: "mc",
        question: "What should you do if a PC case fan has an airflow direction marking?",
        options: ["Use the marking to orient intake or exhaust as intended", "Ignore it and connect the fan to a SATA data port", "Point the marking toward the CPU socket in every build", "Remove the fan label before installing it"],
        answer: "Use the marking to orient intake or exhaust as intended",
        explanation: "Arrows on a fan frame commonly indicate blade rotation and airflow direction."
    },
    {
        type: "mc",
        question: "What is a CPU cooler compatibility check concerned with?",
        options: ["Supported CPU socket and physical clearance", "The SSD's file system", "The monitor's input menu", "The PSU's number of SATA data ports"],
        answer: "Supported CPU socket and physical clearance",
        explanation: "A cooler must support the processor socket and fit within the case without interfering with nearby parts."
    },
    {
        type: "mc",
        question: "What should you check before using a liquid CPU cooler?",
        options: ["That the case supports the radiator size and mounting location", "That the motherboard has a SATA data cable for the radiator", "That the GPU is removed permanently", "That the PSU is installed outside the case"],
        answer: "That the case supports the radiator size and mounting location",
        explanation: "Radiator dimensions and mounting positions vary; check case clearance and the cooler's installation guide."
    },
    {
        type: "mc",
        question: "Where should a CPU cooler pump or fan be connected?",
        options: ["To the motherboard header specified by the cooler and motherboard manuals", "To a SATA data port", "To the front-panel power switch pins", "To the monitor's HDMI port"],
        answer: "To the motherboard header specified by the cooler and motherboard manuals",
        explanation: "Use the designated CPU_FAN, AIO_PUMP, or other recommended header as documented for the specific hardware."
    },
    {
        type: "mc",
        question: "Why should thermal paste be applied according to the cooler or CPU guidance?",
        options: ["The appropriate amount and method depend on the hardware and instructions", "Paste is used to glue the CPU into its socket", "More paste always improves cooling", "Paste should cover the RAM contacts too"],
        answer: "The appropriate amount and method depend on the hardware and instructions",
        explanation: "Follow the manufacturer instructions; excessive paste or paste in sockets and connectors can cause problems."
    },
    {
        type: "mc",
        question: "What should you do if a connector does not seem to fit its socket?",
        options: ["Check its orientation and compatibility instead of forcing it", "Push harder until it clicks", "Trim the connector with scissors", "Apply thermal paste to the pins"],
        answer: "Check its orientation and compatibility instead of forcing it",
        explanation: "Connectors are keyed and designed for specific headers; forcing one can damage the plug or hardware."
    },
    {
        type: "mc",
        question: "What is the purpose of a PCIe slot latch?",
        options: ["Help retain an expansion card in the slot", "Lock the CPU socket cover", "Secure the PSU to the case", "Keep the SSD's files encrypted"],
        answer: "Help retain an expansion card in the slot",
        explanation: "The latch helps hold a PCIe card in place and is released when removing the card."
    },
    {
        type: "mc",
        question: "What should you do before removing a graphics card?",
        options: ["Disconnect its power leads and release the slot latch", "Pull it out while the computer is on", "Remove the CPU cooler first in every case", "Cut the PCIe slot latch"],
        answer: "Disconnect its power leads and release the slot latch",
        explanation: "Power down and unplug the PC, disconnect the GPU power connectors, remove its screws, and release the slot latch carefully."
    },
    {
        type: "mc",
        question: "What is a common symptom of a loose RAM module?",
        options: ["The computer may fail to start or show a memory error", "The case power button changes color permanently", "The SSD becomes physically larger", "The monitor cable stops carrying audio only"],
        answer: "The computer may fail to start or show a memory error",
        explanation: "Poor memory contact can prevent startup or trigger diagnostic indicators; power down before reseating RAM."
    },
    {
        type: "mc",
        question: "A newly built computer powers on but shows no image. What is a sensible first display check?",
        options: ["Confirm the monitor is on, the input is correct, and the cable is connected to the intended video output", "Immediately remove the motherboard battery", "Reformat the boot drive", "Replace all case fans"],
        answer: "Confirm the monitor is on, the input is correct, and the cable is connected to the intended video output",
        explanation: "Check the basic display path first, including monitor power, selected input, cable seating, and the correct graphics output."
    },
    {
        type: "mc",
        question: "A computer shows no signs of powering on. Which basic check is useful?",
        options: ["Check the outlet, power cord, and PSU switch", "Replace the thermal paste on the GPU", "Change the monitor resolution", "Disconnect the case fans permanently"],
        answer: "Check the outlet, power cord, and PSU switch",
        explanation: "Verify the power source, cord connection, and PSU switch before troubleshooting internal components."
    },
    {
        type: "mc",
        question: "What is a safe first step before reseating internal components for troubleshooting?",
        options: ["Shut down, switch off the PSU, and disconnect the power cord", "Keep the computer running to preserve settings", "Touch the PSU circuit board", "Unplug only the keyboard"],
        answer: "Shut down, switch off the PSU, and disconnect the power cord",
        explanation: "Disconnecting power before handling internal hardware helps prevent electrical hazards and accidental shorts."
    },
    {
        type: "mc",
        question: "What can motherboard diagnostic LEDs or beep codes help indicate?",
        options: ["Which hardware check may have failed during startup", "The exact password for the operating system", "How much space is left on an SSD", "The monitor's screen size"],
        answer: "Which hardware check may have failed during startup",
        explanation: "Diagnostic indicators can point toward a startup issue; their meanings are specific to the motherboard manual."
    },
    {
        type: "mc",
        question: "What should you consult to interpret motherboard diagnostic lights?",
        options: ["The motherboard manual", "The case packaging color", "The mouse instruction sheet", "The GPU fan label"],
        answer: "The motherboard manual",
        explanation: "Diagnostic LED labels and meanings differ between boards, so use the motherboard documentation."
    },
    {
        type: "mc",
        question: "What is a reasonable troubleshooting step if a PC fails to boot from the intended drive?",
        options: ["Check firmware boot settings and drive detection", "Disconnect the CPU fan", "Move the monitor cable to a USB port", "Remove all motherboard standoffs"],
        answer: "Check firmware boot settings and drive detection",
        explanation: "Confirm the drive is detected and selected in the boot order before changing or reinstalling software."
    },
    {
        type: "mc",
        question: "What should you do before clearing CMOS or resetting firmware settings?",
        options: ["Follow the motherboard manual and disconnect power as instructed", "Remove the CPU while the PC is running", "Short random motherboard pins", "Connect the CMOS battery to a fan header"],
        answer: "Follow the motherboard manual and disconnect power as instructed",
        explanation: "The correct reset method varies; use the documented jumper or procedure and observe power-safety steps."
    },
    {
        type: "mc",
        question: "Why should you check CPU and motherboard compatibility before a build?",
        options: ["The CPU must be supported by the motherboard socket and firmware", "Every CPU fits every socket", "Compatibility depends only on the case color", "It determines the monitor's cable length"],
        answer: "The CPU must be supported by the motherboard socket and firmware",
        explanation: "A matching physical socket is not always sufficient; confirm the board's CPU support list and BIOS requirements."
    },
    {
        type: "mc",
        question: "Why might a compatible CPU still require a BIOS update to work with a motherboard?",
        options: ["The installed BIOS version may not support that CPU yet", "The CPU needs a SATA power cable", "The BIOS controls the case's screw size", "The graphics card must be installed in a DIMM slot"],
        answer: "The installed BIOS version may not support that CPU yet",
        explanation: "Some processors require a newer firmware version; check the motherboard CPU support list and update guidance."
    },
    {
        type: "mc",
        question: "What should you do before updating motherboard firmware?",
        options: ["Read the manufacturer's instructions and confirm the exact board model", "Use a BIOS file for a similar-looking board", "Disconnect power during the update", "Rename every file on the boot drive"],
        answer: "Read the manufacturer's instructions and confirm the exact board model",
        explanation: "Firmware updates are model-specific; follow the manufacturer's process and avoid interrupting power during the update."
    },
    {
        type: "mc",
        question: "What is a motherboard I/O shield used for?",
        options: ["Cover and align the rear motherboard ports at the case opening", "Cool the processor", "Store BIOS settings without a battery", "Connect the GPU to the PCIe slot"],
        answer: "Cover and align the rear motherboard ports at the case opening",
        explanation: "The I/O shield fits around the rear ports and helps finish the opening where they are accessible."
    },
    {
        type: "mc",
        question: "What does a motherboard's rear I/O panel provide?",
        options: ["External ports for connecting peripherals and displays", "Mounting holes for all case fans", "Power directly from the wall outlet", "A slot for desktop RAM"],
        answer: "External ports for connecting peripherals and displays",
        explanation: "The rear I/O panel exposes motherboard connections such as USB, audio, networking, and sometimes display outputs."
    },
    {
        type: "mc",
        question: "What is a USB motherboard header commonly used for?",
        options: ["Connecting USB ports built into the computer case", "Powering the CPU through the 8-pin connector", "Connecting SATA storage data", "Mounting the graphics card"],
        answer: "Connecting USB ports built into the computer case",
        explanation: "Internal USB headers connect the case's front or top USB ports to the motherboard."
    },
    {
        type: "mc",
        question: "What is a front-panel audio header used for?",
        options: ["Connecting the case's headphone and microphone jacks", "Connecting a monitor to the graphics card", "Supplying power to an M.2 SSD", "Attaching the CPU cooler heatsink"],
        answer: "Connecting the case's headphone and microphone jacks",
        explanation: "The case's front audio lead connects its headphone and microphone jacks to the motherboard audio header."
    },
    {
        type: "mc",
        question: "What is the purpose of a heatsink on a computer component?",
        options: ["Spread and dissipate heat from the component", "Store files when power is off", "Convert video to audio", "Secure the motherboard to the case"],
        answer: "Spread and dissipate heat from the component",
        explanation: "A heatsink increases the surface area available to transfer heat to the surrounding air."
    },
    {
        type: "mc",
        question: "What is a CPU heat spreader?",
        options: ["The metal top surface that helps distribute heat from the processor", "The plastic cover on a case fan", "A type of SATA connector", "The motherboard's front-panel header"],
        answer: "The metal top surface that helps distribute heat from the processor",
        explanation: "The integrated heat spreader transfers heat from the CPU die toward the cooler contact surface."
    },
    {
        type: "mc",
        question: "What does a computer's case power button connect to?",
        options: ["The motherboard front-panel header", "The CPU socket contacts", "The GPU's video output", "The SATA data port"],
        answer: "The motherboard front-panel header",
        explanation: "A small case switch lead connects to the power-switch pins on the motherboard front-panel header."
    },
    {
        type: "mc",
        question: "What is the function of a case reset button?",
        options: ["Request a system restart when connected to the motherboard", "Clear the SSD contents", "Reset the PSU's internal circuitry", "Change the CPU socket type"],
        answer: "Request a system restart when connected to the motherboard",
        explanation: "When present and connected, the reset switch asks the system to restart; it does not erase stored files."
    },
    {
        type: "mc",
        question: "Why should a computer case be placed on a stable surface during assembly?",
        options: ["To reduce the chance it tips or shifts while parts are being installed", "To make the CPU run at a higher clock speed", "To increase the SSD's capacity", "To avoid needing motherboard screws"],
        answer: "To reduce the chance it tips or shifts while parts are being installed",
        explanation: "A stable work surface makes handling components safer and reduces the chance of accidental drops or movement."
    },
    {
        type: "mc",
        question: "What is a benefit of keeping loose screws organized during a PC build?",
        options: ["It helps prevent lost screws and accidental shorts", "It improves the CPU's thermal paste", "It increases the motherboard's memory capacity", "It makes an incompatible PSU cable safe"],
        answer: "It helps prevent lost screws and accidental shorts",
        explanation: "Keeping small hardware contained makes it easier to find the correct screw and prevents loose metal from entering the system."
    },
    {
        type: "mc",
        question: "What should you do if you are unsure which screw belongs to a component?",
        options: ["Check the component or case manual before installing it", "Force the longest screw into place", "Use adhesive instead", "Leave the screw loose inside the case"],
        answer: "Check the component or case manual before installing it",
        explanation: "Using the wrong screw or forcing it can damage threads or hardware; consult the documentation."
    },
    {
        type: "mc",
        question: "What should you do with unused modular PSU cables?",
        options: ["Leave them disconnected and store them safely", "Plug them into random motherboard headers", "Cut off their connectors", "Place them across the CPU fan blades"],
        answer: "Leave them disconnected and store them safely",
        explanation: "Unused modular cables can remain disconnected; keep them organized for future use and clear of fans."
    },
    {
        type: "mc",
        question: "What is cable management inside a PC case mainly intended to help with?",
        options: ["Keeping cables organized and reducing obstruction to airflow or access", "Increasing the CPU's number of cores", "Changing the motherboard firmware", "Making SATA drives work without power"],
        answer: "Keeping cables organized and reducing obstruction to airflow or access",
        explanation: "Routing cables neatly can improve serviceability and keep them away from fans and airflow paths."
    },
    {
        type: "mc",
        question: "Which component converts AC power from the wall into DC power used by a PC?",
        options: ["Power supply unit", "CPU cooler", "Motherboard chipset", "Graphics memory"],
        answer: "Power supply unit",
        explanation: "The PSU converts incoming AC power into the DC outputs used by computer components."
    },
    {
        type: "mc",
        question: "What does non-volatile storage mean?",
        options: ["It retains stored data without continuous power", "It erases files every time the screen turns off", "It only stores data while the CPU fan spins", "It is another name for RAM"],
        answer: "It retains stored data without continuous power",
        explanation: "Non-volatile storage, such as an SSD, retains data when the computer is powered off."
    },
    {
        type: "mc",
        question: "What is one reason to install an operating system on an SSD?",
        options: ["It provides persistent storage and can offer fast access to system files", "It replaces the motherboard's firmware", "It supplies power to the CPU", "It makes the computer immune to malware"],
        answer: "It provides persistent storage and can offer fast access to system files",
        explanation: "An SSD can store the operating system persistently and typically provides fast access to files."
    },
    {
        type: "mc",
        question: "What should you check when choosing a case for a long graphics card?",
        options: ["The case's supported GPU clearance", "The number of audio jacks on the monitor", "The RAM module color", "The SATA cable's data rate only"],
        answer: "The case's supported GPU clearance",
        explanation: "Check the case's GPU length clearance and account for nearby radiators or other components."
    },
    {
        type: "mc",
        question: "Why should you check cooler height before choosing a PC case?",
        options: ["The case must have enough clearance for the CPU cooler", "Cooler height determines how many SSD files fit", "A taller cooler changes the PSU pinout", "The cooler height sets the monitor resolution"],
        answer: "The case must have enough clearance for the CPU cooler",
        explanation: "A tower cooler must fit within the case's maximum CPU-cooler height specification."
    },
    {
        type: "mc",
        question: "What is the best source for instructions specific to installing a component?",
        options: ["The component manufacturer's documentation", "An unrelated cable label", "The computer desktop wallpaper", "A random screw found in the case"],
        answer: "The component manufacturer's documentation",
        explanation: "Manufacturer documentation provides model-specific compatibility, installation, and safety instructions."
    },
    {
        type: "mc",
        question: "What is one purpose of a motherboard BIOS Flashback feature?",
        options: ["Update firmware using a supported procedure that may not require a supported CPU to boot", "Recover deleted SSD files automatically", "Power the graphics card without a PSU", "Install RAM without opening the case"],
        answer: "Update firmware using a supported procedure that may not require a supported CPU to boot",
        explanation: "Some boards support firmware flashing without a working CPU; check the exact model's instructions and requirements."
    },
    {
        type: "mc",
        question: "What is the main reason to avoid touching the gold contacts on memory or expansion cards?",
        options: ["Oils or static discharge may contaminate or damage sensitive contacts", "The contacts contain the operating system", "Touching them permanently changes their voltage", "They are used to attach the case screws"],
        answer: "Oils or static discharge may contaminate or damage sensitive contacts",
        explanation: "Handle boards by their edges and avoid contact surfaces to reduce contamination and electrostatic-discharge risk."
    },
    {
        type: "mc",
        question: "What should you do if a component or connector is visibly damaged?",
        options: ["Do not install it; consult the manufacturer or replace it", "Install it and apply extra force", "Cover the damage with thermal paste", "Connect it while the PC is running"],
        answer: "Do not install it; consult the manufacturer or replace it",
        explanation: "Damaged hardware can be unsafe or cause further damage; stop and seek appropriate support."
    },
    {
        type: "mc",
        question: "What is a common reason to consult a motherboard's memory QVL?",
        options: ["To see memory kits the manufacturer has tested with the board", "To find compatible monitor stands", "To identify the case's screw lengths", "To check the PSU's AC wall voltage"],
        answer: "To see memory kits the manufacturer has tested with the board",
        explanation: "A memory qualified vendor list identifies kits tested by the motherboard manufacturer, though it may not include every compatible kit."
    },
    {
        type: "mc",
        question: "What does a motherboard's CPU support list help you verify?",
        options: ["Whether a processor model is supported and if a BIOS version is required", "Whether a monitor supports wall mounting", "Whether a case fan is quiet", "Whether an SSD contains an operating system"],
        answer: "Whether a processor model is supported and if a BIOS version is required",
        explanation: "The CPU support list gives model-specific compatibility and often notes minimum BIOS versions."
    },
    {
        type: "tf",
        question: "Motherboard standoffs should match the mounting points used by the motherboard.",
        answer: true,
        explanation: "Install standoffs only where the board has mounting holes to support it and avoid contact with the case tray."
    },
    {
        type: "tf",
        question: "A motherboard should be screwed directly against the metal case tray without standoffs.",
        answer: false,
        explanation: "Standoffs support the board above the tray and help prevent accidental electrical contact."
    },
    {
        type: "tf",
        question: "A PCIe graphics card should be secured to the case after it is seated in its slot.",
        answer: true,
        explanation: "The case screw helps hold the expansion card in place after it is correctly installed in the slot."
    },
    {
        type: "tf",
        question: "M.2 describes a form factor and does not by itself guarantee that a drive uses NVMe.",
        answer: true,
        explanation: "M.2 drives may use SATA or PCIe/NVMe, depending on the drive and motherboard slot."
    },
    {
        type: "tf",
        question: "Every M.2 slot supports every M.2 drive interface and length.",
        answer: false,
        explanation: "Slots differ in supported interfaces and sizes; check the motherboard specifications and manual."
    },
    {
        type: "tf",
        question: "An NVMe SSD communicates over PCI Express.",
        answer: true,
        explanation: "NVMe is a storage protocol commonly used by SSDs connected through the PCIe interface."
    },
    {
        type: "tf",
        question: "The motherboard manual can show which RAM slots to populate first.",
        answer: true,
        explanation: "The manual documents recommended memory slot configurations for the specific motherboard."
    },
    {
        type: "tf",
        question: "A case's maximum GPU length can matter when selecting a graphics card.",
        answer: true,
        explanation: "The case needs enough clearance for the card, including any space occupied by radiators or other parts."
    },
    {
        type: "tf",
        question: "A discrete graphics card's display cable should normally be plugged into the card's own video output.",
        answer: true,
        explanation: "Using the discrete card's output connects the monitor to that card's graphics processor."
    },
    {
        type: "tf",
        question: "All CPUs include integrated graphics that can drive a monitor.",
        answer: false,
        explanation: "Integrated graphics availability varies by processor model; check its specifications."
    },
    {
        type: "tf",
        question: "A case's USB ports may need an internal cable connected to a motherboard USB header.",
        answer: true,
        explanation: "Front or top case USB ports commonly connect to internal motherboard headers."
    },
    {
        type: "tf",
        question: "A motherboard's rear I/O panel is where external peripherals can connect.",
        answer: true,
        explanation: "The rear I/O exposes ports such as USB, audio, network, and sometimes display connections."
    },
    {
        type: "tf",
        question: "A PSU's modular cables are safe to interchange between any two PSU models.",
        answer: false,
        explanation: "PSU-side pinouts can differ, so only use cables approved for the exact PSU model."
    },
    {
        type: "tf",
        question: "An 80 PLUS rating describes power-conversion efficiency rather than the PSU's wattage.",
        answer: true,
        explanation: "80 PLUS is an efficiency certification; wattage is a separate PSU specification."
    },
    {
        type: "tf",
        question: "A PSU should be opened by a beginner to inspect its internal components.",
        answer: false,
        explanation: "A PSU may retain dangerous electrical charge; do not open it, even when unplugged."
    },
    {
        type: "tf",
        question: "Dust filters should be cleaned periodically to help maintain airflow.",
        answer: true,
        explanation: "Dust buildup can restrict airflow, so filters should be cleaned using safe procedures."
    },
    {
        type: "tf",
        question: "When cleaning a fan with compressed air, letting it spin as fast as possible is recommended.",
        answer: false,
        explanation: "Hold the blades still while cleaning to avoid overspinning and potentially damaging the fan."
    },
    {
        type: "tf",
        question: "The CPU support list can indicate whether a motherboard needs a particular BIOS version for a processor.",
        answer: true,
        explanation: "Manufacturers often list the minimum firmware version needed for each supported CPU."
    },
    {
        type: "tf",
        question: "A firmware update should be interrupted by switching off the computer midway through the process.",
        answer: false,
        explanation: "Interrupting firmware updates can leave the motherboard unable to start; follow instructions and maintain power."
    },
    {
        type: "tf",
        question: "A case's maximum CPU cooler height is worth checking before choosing a tower cooler.",
        answer: true,
        explanation: "The cooler must fit within the case's available height clearance."
    },
    {
        type: "tf",
        question: "A computer should be disconnected from power before reseating internal parts.",
        answer: true,
        explanation: "Power down and unplug the system before handling internal components."
    },
    {
        type: "tf",
        question: "An SSD boot drive stores the operating system persistently when the computer is off.",
        answer: true,
        explanation: "SSDs are non-volatile storage devices and retain their files without power."
    },
    {
        type: "mc",
        question: "You are about to install a new graphics card. What should you do first?",
        options: ["Shut down the PC, switch off and unplug the PSU, then prepare an ESD-safe workspace", "Leave the PC running so you can test the card immediately", "Remove the CPU while the PC is plugged in", "Connect the graphics card to the monitor before installing it"],
        answer: "Shut down the PC, switch off and unplug the PSU, then prepare an ESD-safe workspace",
        explanation: "Power down and disconnect the computer before handling internal components, and use appropriate ESD precautions."
    },
    {
        type: "mc",
        question: "While installing a CPU, you notice its alignment marker does not match the socket. What should you do?",
        options: ["Lift it away and recheck the alignment before trying again", "Press harder until it sits flat", "Turn the socket lever down over it", "Apply thermal paste to help it slide into place"],
        answer: "Lift it away and recheck the alignment before trying again",
        explanation: "CPU alignment markers indicate the correct orientation. Never force a processor into its socket."
    },
    {
        type: "mc",
        question: "You press a RAM module into its slot, but one retaining clip does not close. What is the best next step?",
        options: ["Remove the module and check that its notch is aligned and the module is seated evenly", "Push down harder on only the open clip", "Use a screwdriver to close the clip", "Turn on the PC to see if it works"],
        answer: "Remove the module and check that its notch is aligned and the module is seated evenly",
        explanation: "A clip that will not close can indicate misalignment or incomplete seating. Recheck the notch and install evenly without forcing it."
    },
    {
        type: "mc",
        question: "Your motherboard has four memory slots and you are installing two RAM sticks. Which slots should you use?",
        options: ["The pair recommended in the motherboard manual", "Any two slots, chosen at random", "The two slots nearest the case edge in every build", "Only the two slots with the largest labels"],
        answer: "The pair recommended in the motherboard manual",
        explanation: "Recommended dual-module slots differ among motherboards. Follow the board manual for the correct configuration."
    },
    {
        type: "mc",
        question: "You are mounting a motherboard and find an extra case standoff under a spot with no mounting hole. What should you do?",
        options: ["Remove the extra standoff before installing the board", "Leave it because all standoffs belong under the board", "Cover it with thermal paste", "Tighten it through the motherboard"],
        answer: "Remove the extra standoff before installing the board",
        explanation: "An extra standoff can contact the underside of the motherboard and cause a short."
    },
    {
        type: "mc",
        question: "A motherboard screw starts to resist before it is snug. What should you do?",
        options: ["Stop and check that the screw is the right size and aligned correctly", "Force it tighter with more leverage", "Use glue to hold the board", "Leave the screwdriver attached and power on"],
        answer: "Stop and check that the screw is the right size and aligned correctly",
        explanation: "A binding screw may be misaligned or incorrect. Forcing it can strip threads or damage the board."
    },
    {
        type: "mc",
        question: "You are installing an M.2 drive, but it is not lining up with the standoff. What should you check?",
        options: ["That the standoff is in the position matching the drive length", "That the SATA power cable is connected first", "That the CPU fan is unplugged", "That the graphics card is removed permanently"],
        answer: "That the standoff is in the position matching the drive length",
        explanation: "M.2 drives come in different lengths. Position the standoff at the matching mounting point and follow the board instructions."
    },
    {
        type: "mc",
        question: "You notice protective film still covering the thermal pad on an M.2 heatsink. What should you do?",
        options: ["Remove the protective film before refitting the heatsink", "Leave the film to improve cooling", "Put the film on the SSD contacts", "Add thermal paste on top of the film"],
        answer: "Remove the protective film before refitting the heatsink",
        explanation: "The protective film must be removed for the thermal pad to contact the drive and transfer heat."
    },
    {
        type: "mc",
        question: "You are about to connect a modular PSU cable left over from a different PSU. What should you do?",
        options: ["Use it only if the PSU manufacturer confirms it is compatible with this exact model", "Connect it if the plug fits", "Cut and rewire it to match", "Use it only for the CPU because CPU cables are universal"],
        answer: "Use it only if the PSU manufacturer confirms it is compatible with this exact model",
        explanation: "A plug that fits does not guarantee matching PSU-side pinouts. Use only cables approved for the exact unit."
    },
    {
        type: "mc",
        question: "You find two similar-looking power cables while building. How should you identify the right one for the CPU power socket?",
        options: ["Check the cable labels and motherboard/PSU documentation for the CPU/EPS lead", "Choose whichever plug fits after pushing hard", "Use the SATA data cable", "Connect both cables to the same socket"],
        answer: "Check the cable labels and motherboard/PSU documentation for the CPU/EPS lead",
        explanation: "Identify power leads by their labels and documentation; do not force a connector that is not intended for the socket."
    },
    {
        type: "mc",
        question: "Your graphics card has an auxiliary power socket, but it is empty. What should you do before starting the PC?",
        options: ["Connect the required compatible PSU power lead according to the card instructions", "Use a SATA data cable to fill the socket", "Leave it empty because the PCIe slot always provides all required power", "Connect the monitor cable to it"],
        answer: "Connect the required compatible PSU power lead according to the card instructions",
        explanation: "Many graphics cards need additional power beyond the PCIe slot. Use the specified PSU cable and follow the card instructions."
    },
    {
        type: "mc",
        question: "You have installed a discrete graphics card, but the monitor is connected to the motherboard video port and shows no image. What should you try?",
        options: ["Connect the monitor to a video output on the graphics card", "Connect the monitor to a USB header inside the case", "Move the display cable to a SATA port", "Remove all RAM"],
        answer: "Connect the monitor to a video output on the graphics card",
        explanation: "When using a discrete graphics card, connect the display to the card's output. Integrated graphics availability also depends on the CPU."
    },
    {
        type: "mc",
        question: "The PC powers on, but the monitor says 'No Signal.' What is a sensible first check?",
        options: ["Check monitor power and input selection, then verify the display cable and output connection", "Immediately replace the motherboard", "Format the boot SSD", "Remove every case fan"],
        answer: "Check monitor power and input selection, then verify the display cable and output connection",
        explanation: "Start with the display path: monitor power, selected input, cable seating, and the correct output."
    },
    {
        type: "mc",
        question: "Your new PC does not power on at all. Which check should come first?",
        options: ["Verify the outlet, power cord, PSU switch, and main power connections", "Reinstall the operating system", "Change the monitor refresh rate", "Replace the CPU cooler fan with a case fan"],
        answer: "Verify the outlet, power cord, PSU switch, and main power connections",
        explanation: "Check the external power source and basic power connections before moving on to more involved troubleshooting."
    },
    {
        type: "mc",
        question: "After building, the case power button does nothing, but the PSU and outlet are confirmed working. What should you inspect next?",
        options: ["Check that the case power-switch lead is on the correct motherboard front-panel pins", "Move the RAM into the GPU slot", "Disconnect the CPU cooler", "Connect the case power button to a SATA port"],
        answer: "Check that the case power-switch lead is on the correct motherboard front-panel pins",
        explanation: "A misplaced front-panel switch lead can prevent the case power button from starting the system. Check the motherboard manual."
    },
    {
        type: "mc",
        question: "Your motherboard's diagnostic light stops at DRAM during startup. What is a reasonable next step?",
        options: ["Power down and check the memory seating and recommended slot placement", "Remove the motherboard standoffs while it is running", "Update the monitor firmware", "Unplug the case power button permanently"],
        answer: "Power down and check the memory seating and recommended slot placement",
        explanation: "A DRAM indicator can point to a memory initialization issue. Shut down, disconnect power, then check seating and slot guidance."
    },
    {
        type: "mc",
        question: "Your motherboard's CPU diagnostic light stays on after a new build. What should you do?",
        options: ["Consult the motherboard manual and verify CPU power, CPU support, and installation with power disconnected", "Force the CPU socket lever down harder", "Connect the CPU cooler to a SATA data port", "Remove the motherboard battery while the PC is on"],
        answer: "Consult the motherboard manual and verify CPU power, CPU support, and installation with power disconnected",
        explanation: "Use the board's diagnostic guidance and check CPU compatibility and power connections safely; never force the processor."
    },
    {
        type: "mc",
        question: "The PC starts and then shuts down shortly afterward, and the CPU temperature is very high. What should you check?",
        options: ["Turn it off and inspect cooler mounting, fan/pump connection, and thermal interface per the instructions", "Keep restarting it until the temperature falls", "Remove the case dust filters while it runs", "Disconnect the CPU cooler fan to reduce noise"],
        answer: "Turn it off and inspect cooler mounting, fan/pump connection, and thermal interface per the instructions",
        explanation: "Shut down to prevent overheating damage, then verify the cooler is mounted correctly and connected as specified."
    },
    {
        type: "mc",
        question: "After installing a CPU cooler, its fan cable is not connected. What should you do before powering on?",
        options: ["Connect it to the motherboard header specified by the cooler and board manuals", "Plug it into a SATA data port", "Leave it disconnected because the heatsink never needs airflow", "Connect it to the front-panel reset pins"],
        answer: "Connect it to the motherboard header specified by the cooler and board manuals",
        explanation: "A cooler fan needs power and control. Use the designated header indicated by the motherboard and cooler instructions."
    },
    {
        type: "mc",
        question: "A case fan spins, but warm air is building up around the components. What should you investigate?",
        options: ["Check fan orientation and the case's intended intake-to-exhaust airflow path", "Remove the CPU from its socket", "Replace the SATA data cable with a longer one", "Disable all motherboard temperature sensors"],
        answer: "Check fan orientation and the case's intended intake-to-exhaust airflow path",
        explanation: "Fan direction and overall airflow layout affect heat removal. Check the fan markings and case airflow guidance."
    },
    {
        type: "mc",
        question: "You are installing a SATA hard drive. The drive has power but is not detected. Which connection should you check?",
        options: ["The SATA data cable between the drive and motherboard", "The case audio lead", "The CPU fan header", "The monitor's power button"],
        answer: "The SATA data cable between the drive and motherboard",
        explanation: "A SATA drive needs both power from the PSU and a data connection to a motherboard SATA port."
    },
    {
        type: "mc",
        question: "A SATA SSD is connected to the motherboard, but it is not receiving power. What should you inspect?",
        options: ["The SATA power lead from the PSU", "The front-panel audio cable", "The CPU socket lever", "The HDMI cable"],
        answer: "The SATA power lead from the PSU",
        explanation: "A SATA SSD requires power from the PSU as well as a separate data connection to the motherboard."
    },
    {
        type: "mc",
        question: "Your PC enters firmware setup instead of loading the operating system after a new drive is installed. What should you check?",
        options: ["Whether the boot drive is detected and selected in the boot order", "Whether the case reset button is illuminated", "Whether the CPU cooler uses two fans", "Whether the monitor is connected to USB"],
        answer: "Whether the boot drive is detected and selected in the boot order",
        explanation: "Check that the intended drive is detected and that firmware is configured to boot from it."
    },
    {
        type: "mc",
        question: "A CPU appears in the motherboard support list, but the installed BIOS may be older. What should you do?",
        options: ["Check the required BIOS version and follow the manufacturer's supported update procedure", "Install a BIOS file for a different board with the same brand", "Interrupt power during startup", "Try to force a different CPU into the socket"],
        answer: "Check the required BIOS version and follow the manufacturer's supported update procedure",
        explanation: "The support list may specify a minimum BIOS version. Use only the exact board's firmware and instructions."
    },
    {
        type: "mc",
        question: "You are choosing a case for a large GPU and a front radiator. What should you verify?",
        options: ["That the GPU and radiator fit together within the case's clearance limits", "That the RAM has the same color as the case", "That the motherboard has two power buttons", "That the SSD is the same length as the GPU"],
        answer: "That the GPU and radiator fit together within the case's clearance limits",
        explanation: "Radiators can reduce available graphics card space. Check the case's documented clearances for the planned layout."
    },
    {
        type: "mc",
        question: "You are about to install a CPU cooler, but its mounting brackets do not match the motherboard socket. What should you do?",
        options: ["Stop and confirm the cooler supports the socket and that the correct mounting hardware is being used", "Drill new holes in the motherboard", "Force the brackets onto the board", "Use the PSU screws instead"],
        answer: "Stop and confirm the cooler supports the socket and that the correct mounting hardware is being used",
        explanation: "Coolers require socket-compatible mounting hardware. Do not force parts or modify the motherboard."
    },
    {
        type: "mc",
        question: "While removing a GPU, it does not lift out after the case screws are removed. What should you check?",
        options: ["That the PCIe slot latch is released and any power leads are disconnected", "That the CPU is removed first", "That the GPU fans are spinning", "That the motherboard is powered on"],
        answer: "That the PCIe slot latch is released and any power leads are disconnected",
        explanation: "The slot latch can retain the card. Power down and unplug, disconnect GPU power, and release the latch gently."
    },
    {
        type: "mc",
        question: "You see a loose screw fall inside the case during assembly. What should you do?",
        options: ["Disconnect power and retrieve the screw before operating the computer", "Power on to see if it rattles", "Leave it if it is not touching a fan", "Push it under the motherboard"],
        answer: "Disconnect power and retrieve the screw before operating the computer",
        explanation: "Loose metal can cause shorts or mechanical damage. Remove it with power disconnected before starting the system."
    },
    {
        type: "mc",
        question: "You accidentally touch the gold contacts on a RAM module while installing it. What is the best response?",
        options: ["Handle it by the edges, avoid further contact, and follow safe installation guidance", "Scrape the contacts with a screwdriver", "Apply thermal paste to the contacts", "Install it while the computer is powered on"],
        answer: "Handle it by the edges, avoid further contact, and follow safe installation guidance",
        explanation: "Avoid touching contact surfaces; handle components by their edges and use appropriate ESD precautions."
    },
    {
        type: "mc",
        question: "While cleaning the PC, compressed air starts spinning a case fan rapidly. What should you do?",
        options: ["Stop and hold the fan blades still while cleaning", "Increase the air pressure", "Add oil to the motherboard", "Keep spinning it until the dust is gone"],
        answer: "Stop and hold the fan blades still while cleaning",
        explanation: "Prevent fans from overspinning during cleaning, which can damage the fan or connected electronics."
    },
    {
        type: "mc",
        question: "You are about to clean a dusty PC, but it is still plugged in. What should you do?",
        options: ["Shut it down and disconnect it from power before cleaning", "Spray cleaner inside while it runs", "Remove the PSU cover first", "Turn the fans to maximum speed"],
        answer: "Shut it down and disconnect it from power before cleaning",
        explanation: "Disconnect power before cleaning and avoid spraying liquids directly onto components."
    },
    {
        type: "mc",
        question: "A PSU begins making a burning smell during a test. What is the safest action?",
        options: ["Switch off and disconnect power, stop using it, and seek qualified support", "Open the PSU while it is plugged in", "Pour water into the PSU", "Keep testing it at higher load"],
        answer: "Switch off and disconnect power, stop using it, and seek qualified support",
        explanation: "A burning smell may signal a serious fault. Do not open a PSU; disconnect it and arrange qualified service or replacement."
    },
    {
        type: "mc",
        question: "During assembly, a connector will not fit the header you selected. What should you do?",
        options: ["Stop and verify the connector, orientation, and header using the manuals", "Push harder until it fits", "Cut off the connector key", "Apply glue to hold it in place"],
        answer: "Stop and verify the connector, orientation, and header using the manuals",
        explanation: "Connectors are keyed for specific headers. Verify compatibility and orientation rather than forcing or modifying them."
    },
    {
        type: "mc",
        question: "You have plugged a case USB lead into a motherboard header, but the connector seems offset. What should you do?",
        options: ["Disconnect it and check the header layout and connector orientation in the manuals", "Bend the header pins until they line up", "Connect it to the CPU power socket", "Power on and adjust it while running"],
        answer: "Disconnect it and check the header layout and connector orientation in the manuals",
        explanation: "Internal headers have specific pin layouts. Avoid bending pins and verify the correct orientation before reconnecting."
    },
    {
        type: "mc",
        question: "You are unsure which tiny pins connect to the case power switch. What is the best source?",
        options: ["The motherboard manual's front-panel header diagram", "The SSD label", "The PSU efficiency sticker", "The monitor's user menu"],
        answer: "The motherboard manual's front-panel header diagram",
        explanation: "Front-panel pin layouts vary by motherboard. Use the board's diagram rather than guessing."
    },
    {
        type: "mc",
        question: "A new motherboard does not line up with the case's mounting points. What should you check?",
        options: ["Whether the case supports that motherboard form factor and the standoffs are correctly placed", "Whether the CPU has integrated graphics", "Whether the SSD uses NVMe", "Whether the monitor is plugged in"],
        answer: "Whether the case supports that motherboard form factor and the standoffs are correctly placed",
        explanation: "Confirm case form-factor support and standoff positions before securing the board."
    },
    {
        type: "mc",
        question: "You find that the CPU cooler is taller than the case's listed clearance. What should you do?",
        options: ["Choose a compatible lower-profile cooler or a case with more clearance", "Force the side panel closed against the cooler", "Remove the CPU fan", "Bend the motherboard"],
        answer: "Choose a compatible lower-profile cooler or a case with more clearance",
        explanation: "The cooler must fit within the case's clearance. Do not put pressure on the cooler or motherboard by forcing the panel."
    },
    {
        type: "mc",
        question: "After installing a GPU, you find its fans are blocked by loose cables. What should you do?",
        options: ["Power down and reroute cables away from the fan blades and airflow path", "Leave the cables there because fans will push them away", "Tie cables to the GPU fan blades", "Remove the GPU's heatsink"],
        answer: "Power down and reroute cables away from the fan blades and airflow path",
        explanation: "Keep cables clear of moving fans and airflow paths. Disconnect power before rearranging internal wiring."
    },
    {
        type: "mc",
        question: "Your case fans are connected, but one does not spin. What should you check?",
        options: ["The fan plug connection, header, and any controller or power requirements", "The SATA data cable's color", "The CPU's alignment triangle", "The monitor input setting only"],
        answer: "The fan plug connection, header, and any controller or power requirements",
        explanation: "Check that the fan is connected correctly and that any hub or controller has the required power and signal connections."
    },
    {
        type: "mc",
        question: "You are assembling a PC and the CPU cooler has pre-applied thermal compound. What should you do?",
        options: ["Use it as directed and avoid adding extra paste unless the instructions say to", "Remove it and cover the socket in paste", "Add paste to the RAM contacts", "Mix it with household glue"],
        answer: "Use it as directed and avoid adding extra paste unless the instructions say to",
        explanation: "Follow the cooler manufacturer's instructions; adding extra compound to a pre-applied layer is usually unnecessary."
    },
    {
        type: "mc",
        question: "You need to remove a cooler for maintenance, and it seems stuck to the CPU. What should you do?",
        options: ["Follow the cooler and CPU manufacturer's safe removal instructions; do not yank or twist forcefully", "Pull sharply straight up with maximum force", "Pry against the motherboard with a metal screwdriver", "Remove it while the PC is powered on"],
        answer: "Follow the cooler and CPU manufacturer's safe removal instructions; do not yank or twist forcefully",
        explanation: "Coolers can adhere to the CPU. Use documented removal guidance and avoid force that could damage the socket or processor."
    },
    {
        type: "mc",
        question: "You are selecting a PSU for a GPU upgrade. Which information should guide your choice?",
        options: ["The GPU and full-system power recommendations, required connectors, and PSU quality", "The case's number of glass panels only", "The amount of RAM installed only", "The monitor's screen resolution alone"],
        answer: "The GPU and full-system power recommendations, required connectors, and PSU quality",
        explanation: "Consider the whole system's power needs, the GPU's required connectors, and a reputable PSU with appropriate capacity."
    },
    {
        type: "mc",
        question: "After adding a second storage drive, the PC will not start and you suspect a power connection issue. What should you inspect?",
        options: ["With power disconnected, verify the PSU connections and use only compatible PSU cables", "Swap in an unverified modular cable", "Open the PSU to inspect the wiring", "Connect the drive's data cable to the wall outlet"],
        answer: "With power disconnected, verify the PSU connections and use only compatible PSU cables",
        explanation: "Check connections safely and use the PSU's approved cables. Never open the PSU or use unverified modular leads."
    },
    {
        type: "mc",
        question: "You are upgrading RAM, but the new kit is a different memory generation from the motherboard's supported type. What should you do?",
        options: ["Choose a memory kit that matches the motherboard's supported generation", "Force the module into the slot", "Remove the slot's plastic key", "Use a SATA adapter"],
        answer: "Choose a memory kit that matches the motherboard's supported generation",
        explanation: "Different RAM generations have different electrical and physical designs and are not interchangeable."
    },
    {
        type: "mc",
        question: "You found a used CPU and want to install it. What should you verify first?",
        options: ["Socket compatibility, motherboard CPU support, BIOS needs, and the CPU's condition", "Only whether its brand matches the case", "Whether it fits in a DIMM slot", "Whether it has SATA power connectors"],
        answer: "Socket compatibility, motherboard CPU support, BIOS needs, and the CPU's condition",
        explanation: "Check the processor against the motherboard's official support information and inspect it for damage before installation."
    },
    {
        type: "mc",
        question: "Your PC boots successfully, but case headphones do not work. What connection should you check?",
        options: ["The case's front audio lead and the motherboard audio header", "The GPU's auxiliary power lead", "The M.2 retaining screw", "The CPU EPS connector"],
        answer: "The case's front audio lead and the motherboard audio header",
        explanation: "Front headphone and microphone jacks rely on the case audio cable connected to the appropriate motherboard header."
    },
    {
        type: "mc",
        question: "Your case's front USB ports do not work, but rear motherboard USB ports do. What should you inspect?",
        options: ["The case USB cable and the matching internal motherboard header", "The CPU cooler mounting pressure", "The monitor's HDMI cable", "The GPU's PCIe latch"],
        answer: "The case USB cable and the matching internal motherboard header",
        explanation: "Working rear ports suggest checking the internal connection for the case's front USB ports."
    },
    {
        type: "mc",
        question: "You are installing a motherboard I/O shield separately, and one metal tab is covering a port. What should you do?",
        options: ["Power down and reposition the shield so it does not obstruct or enter the ports", "Bend the tab into the port while the PC is on", "Remove the motherboard standoffs", "Leave it touching the connector pins"],
        answer: "Power down and reposition the shield so it does not obstruct or enter the ports",
        explanation: "An incorrectly positioned I/O shield can block or contact ports. Correct its fit before using the system."
    },
    {
        type: "mc",
        question: "A screw rolls under the motherboard while the PC is unplugged. What is the safest next step?",
        options: ["Retrieve the screw before powering on, keeping the board supported and avoiding damage", "Leave it there because the PC is unplugged", "Turn the PC on to shake it loose", "Push it toward the PSU fan"],
        answer: "Retrieve the screw before powering on, keeping the board supported and avoiding damage",
        explanation: "A loose screw can cause a short when powered. Remove it carefully before starting the PC."
    },
    {
        type: "mc",
        question: "A newly assembled PC repeatedly restarts during its first boot after a memory change. What is a sensible response?",
        options: ["Allow the board's documented memory training time, then consult its manual if the issue continues", "Immediately switch power off and on repeatedly", "Remove the CPU fan", "Assume the SSD is physically broken"],
        answer: "Allow the board's documented memory training time, then consult its manual if the issue continues",
        explanation: "Some systems take time to train memory after changes. Follow the motherboard guidance and troubleshoot if it does not complete."
    },
    {
        type: "mc",
        question: "After moving a PC, it no longer starts and the power cable feels loose. What should you do?",
        options: ["Switch the PSU off and reseat the external power cable securely at both ends", "Open the PSU and tighten its internal wires", "Pull on the cable while the PC is running", "Replace the CPU with a different socket type"],
        answer: "Switch the PSU off and reseat the external power cable securely at both ends",
        explanation: "Check external power connections safely first. Never open the PSU."
    },
    {
        type: "mc",
        question: "You installed an M.2 SSD, but it does not appear in firmware. What should you check?",
        options: ["The drive's seating, slot compatibility, and any shared-port limitations in the motherboard manual", "The monitor's speaker volume", "The case power button's LED color", "The GPU fan direction only"],
        answer: "The drive's seating, slot compatibility, and any shared-port limitations in the motherboard manual",
        explanation: "M.2 slots may have interface or lane-sharing limitations. Check seating and the motherboard documentation."
    },
    {
        type: "mc",
        question: "The display works from the discrete GPU, but you want to use the CPU's integrated graphics. What should you confirm?",
        options: ["That the exact CPU includes integrated graphics and the motherboard provides a supported display output", "That the PSU has a SATA data cable", "That the case has two power buttons", "That the GPU is installed in a DIMM slot"],
        answer: "That the exact CPU includes integrated graphics and the motherboard provides a supported display output",
        explanation: "Integrated graphics is not present on every CPU. Check the processor and motherboard specifications before relying on it."
    },
    {
        type: "mc",
        question: "You are installing several drives and the motherboard manual says two SATA ports are disabled when a particular M.2 slot is used. What should you do?",
        options: ["Plan the drive connections using the manual's port-sharing information", "Connect all drives to the disabled ports anyway", "Remove the case's power button", "Use the CPU fan header for SATA data"],
        answer: "Plan the drive connections using the manual's port-sharing information",
        explanation: "Some boards share lanes or ports. Use the manual to choose active connections for the intended storage setup."
    },
    {
        type: "mc",
        question: "A case fan's airflow arrows point opposite the direction you want. What should you do?",
        options: ["Reorient the fan so airflow matches the planned intake or exhaust position", "Reverse the PSU's modular cable", "Turn the fan blades by hand while powered", "Remove the fan's motor"],
        answer: "Reorient the fan so airflow matches the planned intake or exhaust position",
        explanation: "Install the fan in the orientation that provides the intended case airflow, using its markings as a guide."
    },
    {
        type: "mc",
        question: "A power connector is almost seated, but its latch has not engaged. What should you do?",
        options: ["Power down if needed and check alignment, then seat it correctly without excessive force", "Pull on the wires until it clicks", "Glue it to the socket", "Leave it partly connected and start the PC"],
        answer: "Power down if needed and check alignment, then seat it correctly without excessive force",
        explanation: "A partially seated power connector can cause instability. Check orientation and fit, and never force or pull on the wires."
    },
    {
        type: "mc",
        question: "Your CPU cooler package includes several mounting kits. Which one should you select?",
        options: ["The kit specified for your motherboard's CPU socket", "The kit with the most screws", "The kit intended for a different brand's GPU", "Any kit that can be bent into place"],
        answer: "The kit specified for your motherboard's CPU socket",
        explanation: "Use the socket-specific mounting hardware identified in the cooler's instructions."
    },
    {
        type: "mc",
        question: "A child or pet is nearby while you are assembling a PC, and small screws are on the work surface. What should you do?",
        options: ["Pause and secure small parts and tools out of reach before continuing", "Leave the screws scattered to save time", "Put the screws inside a powered PSU", "Continue while holding the motherboard in one hand"],
        answer: "Pause and secure small parts and tools out of reach before continuing",
        explanation: "Keep small parts and tools contained and the work area stable to prevent accidents or lost hardware."
    }
];


/* =========================================
   QUIZ STATE
========================================= */

let quizDifficulty = "easy";

const quizQuestionCount = 20;

let quizQuestionsForGame = [];

let quizCurrentQuestion = 0;

let quizScore = 0;

let quizCorrect = 0;

let quizMistakes = 0;

let quizTimer = null;

let quizTimeLeft = 15;


/* =========================================
   START QUIZ
========================================= */

function startQuiz() {

    showQuizDifficultyMenu();
}


/* =========================================
   QUIZ DIFFICULTY MENU
========================================= */

function showQuizDifficultyMenu() {

    const old =
        document.getElementById(
            "quiz-difficulty-overlay"
        );


    if (old) {
        old.remove();
    }


    const overlay =
        document.createElement("div");

    overlay.id =
        "quiz-difficulty-overlay";

    overlay.className =
        "quiz-difficulty-overlay";


    const box =
        document.createElement("div");

    box.className =
        "quiz-difficulty-box";


    const title =
        document.createElement("h2");

    title.textContent =
        "QUIZ DIFFICULTY";


    const description =
        document.createElement("p");

    description.textContent =
        "Choose your quiz difficulty.";


    const buttons =
        document.createElement("div");

    buttons.className =
        "quiz-difficulty-buttons";


    const easy =
        document.createElement("button");

    easy.className =
        "quiz-difficulty-button";

    easy.innerHTML =
        `
        <strong>EASY</strong>
        <small>Unlimited time</small>
        `;

    easy.addEventListener(
        "click",
        () => {

            overlay.remove();

            beginQuiz(
                "easy"
            );
        }
    );


    const hard =
        document.createElement("button");

    hard.className =
        "quiz-difficulty-button";

    hard.innerHTML =
        `
        <strong>HARD</strong>
        <small>15 seconds per question</small>
        `;

    hard.addEventListener(
        "click",
        () => {

            overlay.remove();

            beginQuiz(
                "hard"
            );
        }
    );


    buttons.appendChild(
        easy
    );

    buttons.appendChild(
        hard
    );


    const cancel =
        document.createElement("button");

    cancel.className =
        "quiz-cancel-button";

    cancel.textContent =
        "CANCEL";


    cancel.addEventListener(
        "click",
        () => {

            overlay.remove();
        }
    );


    box.appendChild(title);

    box.appendChild(description);

    box.appendChild(buttons);

    box.appendChild(cancel);

    overlay.appendChild(box);

    document.body.appendChild(
        overlay
    );
}


/* =========================================
   BEGIN QUIZ
========================================= */

function beginQuiz(
    difficulty
) {

    quizDifficulty =
        difficulty;


    quizQuestionsForGame =
        shuffleArray(
            quizQuestions
        ).slice(
            0,
            quizQuestionCount
        );


    quizCurrentQuestion = 0;

    quizScore = 0;

    quizCorrect = 0;

    quizMistakes = 0;


    stopQuizTimer();


    const score =
        document.getElementById(
            "quiz-score"
        );


    if (score) {
        score.textContent = "0";
    }


    showScreen(
        "quiz"
    );


    showQuizQuestion();
}


/* =========================================
   SHOW QUIZ QUESTION
========================================= */

function showQuizQuestion() {

    stopQuizTimer();


    if (
        quizCurrentQuestion >=
        quizQuestionsForGame.length
    ) {

        finishQuiz();

        return;
    }


    const question =
        quizQuestionsForGame[
            quizCurrentQuestion
        ];


    const number =
        document.getElementById(
            "quiz-number"
        );

    const text =
        document.getElementById(
            "quiz-question"
        );

    const options =
        document.getElementById(
            "quiz-options"
        );

    const timer =
        document.getElementById(
            "quiz-timer"
        );

    const total =
        document.getElementById(
            "quiz-total"
        );

    const feedback =
        document.getElementById(
            "quiz-feedback"
        );

    const nextButton =
        document.getElementById(
            "quiz-next"
        );

    if (number) {

        number.textContent =
            quizCurrentQuestion + 1;
    }


    if (text) {

        text.textContent =
            question.question;
    }

    if (total) {

        total.textContent =
            quizQuestionsForGame.length;
    }

    if (options) {

        options.innerHTML = "";
    }

    if (feedback) {
        feedback.hidden = true;
    }

    if (nextButton) {
        nextButton.onclick = null;
    }


    /*
       EASY
    */

    if (
        quizDifficulty ===
        "easy"
    ) {

        if (timer) {

            timer.textContent =
                "Time: Unlimited";
        }

    }


    /*
       HARD
    */

    if (
        quizDifficulty ===
        "hard"
    ) {

        quizTimeLeft = 15;

        updateQuizTimer();


        quizTimer =
            setInterval(() => {

                quizTimeLeft--;

                updateQuizTimer();


                if (
                    quizTimeLeft <= 0
                ) {

                    stopQuizTimer();

                    handleQuizAnswer(
                        false,
                        true
                    );
                }

            }, 1000);
    }


    /*
       TRUE / FALSE
    */

    if (
        question.type ===
        "tf"
    ) {

        createQuizButton(
            "TRUE",
            question.answer === true
        );


        createQuizButton(
            "FALSE",
            question.answer === false
        );


        return;
    }


    /*
       MULTIPLE CHOICE
    */

    const shuffledOptions =
        shuffleArray(
            question.options
        );


    shuffledOptions.forEach(
        option => {

            createQuizButton(
                option,
                option === question.answer
            );
        }
    );
}


/* =========================================
   CREATE QUIZ BUTTON
========================================= */

function createQuizButton(
    text,
    correct
) {

    const container =
        document.getElementById(
            "quiz-options"
        );


    if (!container) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";

    button.className =
        "quiz-option";

    button.textContent =
        text;


    button.dataset.correct =
        correct
            ? "true"
            : "false";


    button.addEventListener(
        "click",
        () => {

            handleQuizAnswer(
                correct,
                false,
                button
            );
        }
    );


    container.appendChild(
        button
    );
}


/* =========================================
   QUIZ ANSWER
========================================= */

function handleQuizAnswer(
    correct,
    timedOut = false,
    selectedButton = null
) {

    /*
       Prevent double answer.
    */

    const buttons =
        document.querySelectorAll(
            "#quiz-options .quiz-option"
        );


    buttons.forEach(button => {

        button.disabled = true;

        if (
            button.dataset.correct ===
            "true"
        ) {

            button.classList.add(
                "correct"
            );
        }
    });

    if (!correct && selectedButton) {
        selectedButton.classList.add("wrong");
    }


    stopQuizTimer();


    if (correct) {

        quizScore += 10;

        quizCorrect++;

    } else {

        quizMistakes++;

        buttons.forEach(button => {

            if (
                button.dataset.correct ===
                "true"
            ) {

                button.classList.add(
                    "correct"
                );
            }
        });
    }


    const score =
        document.getElementById(
            "quiz-score"
        );


    if (score) {

        score.textContent =
            quizScore;
    }


    if (!correct) {
        const question =
            quizQuestionsForGame[quizCurrentQuestion];

        const feedback =
            document.getElementById("quiz-feedback");

        const explanation =
            document.getElementById("quiz-explanation");

        const nextButton =
            document.getElementById("quiz-next");

        if (feedback && explanation && nextButton && question) {
            const answer = question.type === "tf"
                ? question.answer ? "True" : "False"
                : question.answer;

            explanation.textContent =
                `${timedOut ? "Time ran out. " : ""}` +
                `The correct answer is ${answer}. ${question.explanation}`;

            feedback.hidden = false;
            nextButton.onclick = () => {
                quizCurrentQuestion++;
                showQuizQuestion();
            };
            nextButton.focus();
            return;
        }
    }

    /*
       Move to the next question after a brief pause for correct answers.
    */
    setTimeout(() => {

        quizCurrentQuestion++;

        showQuizQuestion();

    }, 500);
}


/* =========================================
   QUIZ TIMER
========================================= */

function updateQuizTimer() {

    const timer =
        document.getElementById(
            "quiz-timer"
        );


    if (!timer) {
        return;
    }


    timer.textContent =
        `Time: ${quizTimeLeft}s`;


    if (
        quizTimeLeft <= 5
    ) {

        timer.style.color =
            "#ef5350";

    } else {

        timer.style.color =
            "";
    }
}


function stopQuizTimer() {

    if (quizTimer) {

        clearInterval(
            quizTimer
        );

        quizTimer = null;
    }
}


/* =========================================
   FINISH QUIZ
========================================= */

function finishQuiz() {

    stopQuizTimer();


    setResultValues(
        "QUIZ COMPLETE!",
        quizScore,
        quizCorrect,
        quizQuestionsForGame.length
    );


    showScreen(
        "results"
    );
}


/* =========================================
   OLD QUIZ COMPATIBILITY
========================================= */

function answerQuiz(
    correct
) {

    handleQuizAnswer(
        correct,
        false
    );
}


/* =========================================
   OLD RESULT COMPATIBILITY
========================================= */

function showResults() {

    finishQuiz();
}


/* =========================================
   PAGE START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           Make sure the splash screen
           starts correctly.
        */

        const screens =
            document.querySelectorAll(
                ".screen"
            );


        const active =
            document.querySelector(
                ".screen.active"
            );


        if (!active && screens.length) {

            screens.forEach(
                screen => {
                    screen.classList.remove(
                        "active"
                    );
                }
            );


            screens[0].classList.add(
                "active"
            );
        }


        /*
           Initialize Learn Mode.
        */

        initializeLearnMode();

        const music =
            document.getElementById("background-music");
        const musicVolume =
            document.getElementById("music-volume");
        const musicVolumeValue =
            document.getElementById("music-volume-value");

        if (music && musicVolume) {
            music.volume =
                Number(musicVolume.value) / 100;

            musicVolume.addEventListener("input", () => {
                music.volume =
                    Number(musicVolume.value) / 100;

                if (musicVolumeValue) {
                    musicVolumeValue.textContent =
                        `${musicVolume.value}%`;
                }
            });
        }

        const tutorialPrevious =
            document.getElementById("tutorial-previous");
        const tutorialNext =
            document.getElementById("tutorial-next");

        if (tutorialPrevious) {
            tutorialPrevious.addEventListener("click", () => {
                updateTutorialStep(tutorialStepIndex - 1);
            });
        }

        if (tutorialNext) {
            tutorialNext.addEventListener("click", () => {
                updateTutorialStep(tutorialStepIndex + 1);
            });
        }

        updateTutorialStep(0);


        console.log(
            "Computer Assembly Educational Game loaded successfully."
        );
    }
);