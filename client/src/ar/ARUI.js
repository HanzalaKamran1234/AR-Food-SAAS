export const showARLoading = (message) => {
    let loader = document.getElementById('arLoaderOverlay');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'arLoaderOverlay';
        loader.className = 'fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-[90]';
        document.body.appendChild(loader);
    }
    loader.innerHTML = `
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-6"></div>
        <p class="text-white text-xl font-bold animate-pulse">${message}</p>
        <button id="cancelArBtn" class="mt-8 px-6 py-2 border border-gray-600 text-gray-400 rounded-full hover:bg-gray-800 transition">Cancel</button>
    `;
    loader.classList.remove('hidden');

    return new Promise((resolve) => {
        document.getElementById('cancelArBtn').addEventListener('click', () => {
            hideARLoading();
            resolve('cancelled');
        });
    });
};

export const hideARLoading = () => {
    const loader = document.getElementById('arLoaderOverlay');
    if (loader) {
        loader.classList.add('hidden');
    }
};

export const showIncompatibleOverlay = () => {
    alert("Your current device or browser does not support Augmented Reality via WebXR. Please try again on a supported mobile device (e.g., Chrome on Android or WebXR viewer on iOS).");
};

export const showARControls = (manager) => {
    let controls = document.getElementById('arInteractionControls');
    if (!controls) {
        controls = document.createElement('div');
        controls.id = 'arInteractionControls';
        controls.className = 'fixed bottom-10 left-0 right-0 flex justify-center space-x-4 z-[100] px-4';
        
        controls.innerHTML = `
            <div class="bg-black bg-opacity-70 rounded-full py-2 px-6 flex items-center space-x-6 backdrop-blur-md border border-gray-600 shadow-2xl">
                <button id="btnARScaleDown" class="text-white hover:text-orange-400 font-bold text-2xl px-2 transition-colors">-</button>
                <div class="h-6 w-px bg-gray-500"></div>
                <button id="btnARScaleUp" class="text-white hover:text-orange-400 font-bold text-2xl px-2 transition-colors">+</button>
                <div class="h-6 w-px bg-gray-500"></div>
                <button id="btnARRotateL" class="text-white hover:text-orange-400 px-2 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                </button>
                <div class="h-6 w-px bg-gray-500"></div>
                <button id="btnARRotateR" class="text-white hover:text-orange-400 px-2 transition-colors" style="transform: scaleX(-1);">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                </button>
                <div class="h-6 w-px bg-gray-500"></div>
                <button id="btnARReset" class="text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider px-2 transition-colors">Reset</button>
                <div class="h-6 w-px bg-gray-500"></div>
                <button id="btnARScreenshot" class="text-blue-400 hover:text-blue-300 px-2 transition-colors" title="Screenshot">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </button>
            </div>
        `;
        document.body.appendChild(controls);
        
        // Fast gesture bindings to ARManager
        let scaleInterval, rotateInterval;

        // Scale Down
        const btnScaleDown = document.getElementById('btnARScaleDown');
        btnScaleDown.addEventListener('touchstart', () => scaleInterval = setInterval(() => manager.scaleObject(0.98), 16));
        btnScaleDown.addEventListener('touchend', () => clearInterval(scaleInterval));
        btnScaleDown.addEventListener('mousedown', () => scaleInterval = setInterval(() => manager.scaleObject(0.98), 16));
        btnScaleDown.addEventListener('mouseup', () => clearInterval(scaleInterval));
        btnScaleDown.addEventListener('mouseleave', () => clearInterval(scaleInterval));

        // Scale Up
        const btnScaleUp = document.getElementById('btnARScaleUp');
        btnScaleUp.addEventListener('touchstart', () => scaleInterval = setInterval(() => manager.scaleObject(1.02), 16));
        btnScaleUp.addEventListener('touchend', () => clearInterval(scaleInterval));
        btnScaleUp.addEventListener('mousedown', () => scaleInterval = setInterval(() => manager.scaleObject(1.02), 16));
        btnScaleUp.addEventListener('mouseup', () => clearInterval(scaleInterval));
        btnScaleUp.addEventListener('mouseleave', () => clearInterval(scaleInterval));

        // Rotate Left
        const btnRotateL = document.getElementById('btnARRotateL');
        btnRotateL.addEventListener('touchstart', () => rotateInterval = setInterval(() => manager.rotateObject(0.05), 16));
        btnRotateL.addEventListener('touchend', () => clearInterval(rotateInterval));
        btnRotateL.addEventListener('mousedown', () => rotateInterval = setInterval(() => manager.rotateObject(0.05), 16));
        btnRotateL.addEventListener('mouseup', () => clearInterval(rotateInterval));
        btnRotateL.addEventListener('mouseleave', () => clearInterval(rotateInterval));

        // Rotate Right
        const btnRotateR = document.getElementById('btnARRotateR');
        btnRotateR.addEventListener('touchstart', () => rotateInterval = setInterval(() => manager.rotateObject(-0.05), 16));
        btnRotateR.addEventListener('touchend', () => clearInterval(rotateInterval));
        btnRotateR.addEventListener('mousedown', () => rotateInterval = setInterval(() => manager.rotateObject(-0.05), 16));
        btnRotateR.addEventListener('mouseup', () => clearInterval(rotateInterval));
        btnRotateR.addEventListener('mouseleave', () => clearInterval(rotateInterval));

        // Reset
        document.getElementById('btnARReset').addEventListener('click', () => manager.resetObject());
        
        // Screenshot
        const btnARScreenshot = document.getElementById('btnARScreenshot');
        if (btnARScreenshot) {
            btnARScreenshot.addEventListener('click', () => {
                manager.takeScreenshot();
                
                // Visual Flash
                const flash = document.createElement('div');
                flash.className = 'fixed inset-0 bg-white opacity-0 z-[200] transition-opacity duration-300 pointer-events-none';
                document.body.appendChild(flash);
                setTimeout(() => flash.classList.remove('opacity-0'), 10);
                setTimeout(() => {
                    flash.classList.add('opacity-0');
                    setTimeout(() => flash.remove(), 300);
                }, 200);
            });
        }
    }
    controls.classList.remove('hidden');
};

export const hideARControls = () => {
    const controls = document.getElementById('arInteractionControls');
    if (controls) controls.classList.add('hidden');
};
