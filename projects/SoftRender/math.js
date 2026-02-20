/**
 * SOFTRENDER MATH LIBRARY
 * Pure JavaScript implementation of Linear Algebra for 3D Graphics.
 * Includes Vector3, Matrix4, and Quaternion logic.
 * * * @author saiusesgithub
 * @version 1.0.0
 */

/* =========================================
   1. CONSTANTS & UTILS
   ========================================= */
const TO_RAD = Math.PI / 180;
const TO_DEG = 180 / Math.PI;

/* =========================================
   2. VECTOR 3 CLASS
   ========================================= */
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // --- Basic Operations ---
    add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    mul(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
    div(s) { return new Vec3(this.x / s, this.y / s, this.z / s); }

    // --- Vector Math ---
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize() {
        const m = this.mag();
        if (m === 0) return new Vec3(0, 0, 0);
        return this.div(m);
    }

    clone() { return new Vec3(this.x, this.y, this.z); }
}

/* =========================================
   3. MATRIX 4x4 CLASS
   ========================================= */
/**
 * Represents a 4x4 Matrix using a Float32Array (Row-major internal logic)
 * [ 0  1  2  3 ]
 * [ 4  5  6  7 ]
 * [ 8  9 10 11 ]
 * [12 13 14 15 ]
 */
class Mat4 {
    constructor() {
        this.m = new Float32Array(16);
        this.identity();
    }

    identity() {
        this.m.fill(0);
        this.m[0] = 1; this.m[5] = 1; this.m[10] = 1; this.m[15] = 1;
        return this;
    }

    // Multiply this matrix by another (A * B)
    multiply(mat) {
        const a = this.m;
        const b = mat.m;
        const out = new Float32Array(16);

        for (let i = 0; i < 4; i++) { // Row
            for (let j = 0; j < 4; j++) { // Col
                // Dot product of Row A and Col B
                out[i * 4 + j] =
                    a[i * 4 + 0] * b[0 * 4 + j] +
                    a[i * 4 + 1] * b[1 * 4 + j] +
                    a[i * 4 + 2] * b[2 * 4 + j] +
                    a[i * 4 + 3] * b[3 * 4 + j];
            }
        }
        this.m = out;
        return this;
    }

    // --- Transformations ---

    static translation(x, y, z) {
        const mat = new Mat4();
        mat.m[3] = x;
        mat.m[7] = y;
        mat.m[11] = z;
        return mat;
    }

    static scaling(x, y, z) {
        const mat = new Mat4();
        mat.m[0] = x;
        mat.m[5] = y;
        mat.m[10] = z;
        return mat;
    }

    static rotationX(rad) {
        const mat = new Mat4();
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        mat.m[5] = c; mat.m[6] = -s;
        mat.m[9] = s; mat.m[10] = c;
        return mat;
    }

    static rotationY(rad) {
        const mat = new Mat4();
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        mat.m[0] = c; mat.m[2] = s;
        mat.m[8] = -s; mat.m[10] = c;
        return mat;
    }

    static rotationZ(rad) {
        const mat = new Mat4();
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        mat.m[0] = c; mat.m[1] = -s;
        mat.m[4] = s; mat.m[5] = c;
        return mat;
    }

    // Compose Position/Rotation/Scale into one World Matrix
    static compose(pos, rot, scale) {
        let m = new Mat4();
        // Order matters: T * R * S
        m.multiply(Mat4.translation(pos.x, pos.y, pos.z));
        m.multiply(Mat4.rotationZ(rot.z * TO_RAD));
        m.multiply(Mat4.rotationY(rot.y * TO_RAD));
        m.multiply(Mat4.rotationX(rot.x * TO_RAD));
        m.multiply(Mat4.scaling(scale.x, scale.y, scale.z));
        return m;
    }

    // --- Projection & Camera ---

    // Create Perspective Projection Matrix
    // Fov: Field of View in Degrees
    // Aspect: Width/Height
    // Near/Far: Clipping planes
    static perspective(fov, aspect, near, far) {
        const mat = new Mat4();
        const f = 1.0 / Math.tan((fov * TO_RAD) / 2);
        const rangeInv = 1.0 / (near - far);

        mat.m[0] = f / aspect;
        mat.m[5] = f;
        mat.m[10] = (near + far) * rangeInv;
        mat.m[11] = near * far * rangeInv * 2;
        mat.m[14] = -1;
        mat.m[15] = 0;

        return mat;
    }

    // LookAt Matrix (View Matrix)
    // Eye: Camera Pos, Target: Look Pos, Up: Up Vector
    static lookAt(eye, target, up) {
        const zAxis = eye.sub(target).normalize(); // Forward
        const xAxis = up.cross(zAxis).normalize(); // Right
        const yAxis = zAxis.cross(xAxis).normalize(); // Up

        const mat = new Mat4();
        // Row 1
        mat.m[0] = xAxis.x; mat.m[1] = xAxis.y; mat.m[2] = xAxis.z; mat.m[3] = -xAxis.dot(eye);
        // Row 2
        mat.m[4] = yAxis.x; mat.m[5] = yAxis.y; mat.m[6] = yAxis.z; mat.m[7] = -yAxis.dot(eye);
        // Row 3
        mat.m[8] = zAxis.x; mat.m[9] = zAxis.y; mat.m[10] = zAxis.z; mat.m[11] = -zAxis.dot(eye);
        // Row 4 is 0,0,0,1 (already identity)

        return mat;
    }

    // --- Pipeline Ops ---

    // Transform a Vector3 by this Matrix (v' = M * v)
    transformVec3(v) {
        const x = v.x, y = v.y, z = v.z;
        const m = this.m;

        const w = m[12] * x + m[13] * y + m[14] * z + m[15];

        // Return 4D vector components, we usually divide by W later for projection
        return {
            x: m[0] * x + m[1] * y + m[2] * z + m[3],
            y: m[4] * x + m[5] * y + m[6] * z + m[7],
            z: m[8] * x + m[9] * y + m[10] * z + m[11],
            w: w
        };
    }
}