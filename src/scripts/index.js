"use strict";
console.log("Hello, WebGPU!");
init();
async function init() {
    if (navigator.gpu === undefined) {
        console.log("WebGPU is not supported.");
        return;
    }
    console.log("WebGPU is supported.");
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter === null) {
        console.log("No GPU adapter found.");
        return;
    }
    const adapterInfo = await adapter.requestAdapterInfo();
    console.log(adapterInfo);
    const device = await adapter.requestDevice({
        label: "device",
        requiredFeatures: [],
        requiredLimits: {},
    });
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    document.body.appendChild(canvas);
    const context = canvas.getContext("webgpu");
    if (context === null) {
        console.log("Failed to get rendering context.");
        return;
    }
    context.configure({
        device,
        format: "bgra8unorm",
    });
    //   $v_0 = (-0.75, -0.75, 0, 1)$
    // $v_1 = (0, 0.75, 0, 1)$
    // $v_2 = (0.75, -0.75, 0, 1)$
    const VERTICES = Float32Array.from([
        -0.75, -0.75, 0, 1, 0, 0.75, 0, 1, 0.75, -0.75, 0, 1,
    ]);
    const vertexBuffer = device.createBuffer({
        size: VERTICES.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, VERTICES);
    const shaderCode = await fetch("./shader.wgsl").then((res) => res.text());
    const shaderModule = device.createShaderModule({
        code: shaderCode,
    });
    const pipelineDescriptor = {
        vertex: {
            module: shaderModule,
            entryPoint: "vs",
            buffers: [
                {
                    arrayStride: 16,
                    stepMode: "vertex",
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: "float32x4",
                        },
                    ],
                },
            ],
        },
        fragment: {
            module: shaderModule,
            entryPoint: "fs",
            targets: [
                {
                    format: navigator.gpu.getPreferredCanvasFormat(),
                },
            ],
        },
        primitive: {
            topology: "triangle-list",
        },
        layout: "auto",
    };
    const renderPipeline = device.createRenderPipeline(pipelineDescriptor);
    const commandEncoder = device.createCommandEncoder();
    const renderPassDescriptor = {
        colorAttachments: [
            {
                clearValue: { r: 0, g: 0.5, b: 0, a: 1 },
                loadOp: "clear",
                storeOp: "store",
                view: context.getCurrentTexture().createView(),
            },
        ],
    };
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(renderPipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.draw(3);
    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
}
