@vertex
fn vs(@location(0) position: vec4<f32>) -> @builtin(position)  vec4<f32> {
    return position;
}

@fragment
fn fs(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}