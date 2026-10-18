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


    /*
       Randomly choose a full round of questions
       from the complete question bank.
    */

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