/*  Funzioni necessarie a generare e salvare
    screenshots di un modello renderizzato in ambiente OpenGL 
*/

#include "generateScreenshots.h"

void generate(func render, float[16] projection, int stepMultiRis, std::string screenshotsPath) {

    for (int scl = 0; scl < stepMultiRis; scl++) {
        int gridDim = static_cast<int>(pow(2, scl));

        for (int i = 0; i < gridDim; i++) {
            for (int j = 0; j < gridDim; j++) {

                projection = getProjectionModifier(i, j, gridDim);

                render(projection);

                std::string path = screenshotsPath + std::to_string(gridDim) + "-" + std::to_string(i) + "-" + std::to_string(j) + ".png";

                const char* charpath = path.c_str();

                saveScreenshot(SCR_WIDTH, SCR_HEIGHT, charpath);
            }
        }
    }
}

//funzioni
void saveScreenshot(int width, int height, const char* filepath) {
    // Buffer per contenere i pixel
    unsigned char* pixels = new unsigned char[3 * width * height];  // 3 perchè usiamo RGB

    // Leggi i pixel dal framebuffer
    glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, pixels);

    // Inverti l'immagine sull'asse Y (OpenGL salva al contrario)
    unsigned char* flippedPixels = new unsigned char[3 * width * height];
    for (int y = 0; y < height; ++y) {
        memcpy(flippedPixels + 3 * width * y, pixels + 3 * width * (height - 1 - y), 3 * width);
    }

    // Scrivi il file PNG
    stbi_write_png(filepath, width, height, 3, flippedPixels, width * 3);

    // Libera la memoria
    delete[] pixels;
    delete[] flippedPixels;
}

glm::mat4 getProjectionModifier(int i, int j, int n) {

    float xOffSet = n - (2 * i) - 1;
    float yOffSet = n - (2 * j) - 1;

    glm::mat4 scalingFactor = glm::scale(glm::mat4(1.0f), glm::vec3(n, n, 1.0f));
    glm::mat4 translateFactor = glm::translate(glm::mat4(1.0f), glm::vec3(xOffSet, yOffSet, 0.0f));

    return translateFactor * scalingFactor;
}

