/*  Funzioni necessarie a generare e salvare
    screenshots di un render in ambiente OpenGL 
*/

#include "generateScreenshots.h"

#define GLM_ENABLE_EXPERIMENTAL

#include <glad/glad.h>
#include <GLFW/glfw3.h>

#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include <stb_image.h>
#include <stb_image_write.h>
#include <gtx/transform.hpp>
#include <gtc/type_ptr.hpp>

#include <string>

void generate(std::function<void()> render, float* projection, int stepMultiRis, std::string screenshotsPath, const unsigned int SCR_WIDTH, const unsigned int SCR_HEIGHT) {
    /*
    * @param render - funzione per il render
    * @param projection - matrice di proiezione
    * @param stepMultirisoluzione - numero di livelli di risoluzione che si intende generare
    * @param screenshotsPath - percorso dove si intendono salvare gli screenshots
    * @param SCR_WIDTH - larghezza in px per ogni screenshot
    * @param SCR_HEIGHT - altezza in px per ogni screenshot
    */
    glm::mat4 proj = glm::make_mat4(projection);

    for (int scl = 0; scl < stepMultiRis; scl++) {
        int gridDim = static_cast<int>(pow(2, scl));

        for (int i = 0; i < gridDim; i++) {
            for (int j = 0; j < gridDim; j++) {

                proj = getProjectionModifier(i, j, gridDim) * proj;
                projection = glm::value_ptr(proj);

                render();

                std::string path = screenshotsPath + std::to_string(gridDim) + "-" + std::to_string(i) + "-" + std::to_string(j) + ".png";

                const char* charpath = path.c_str();

                saveScreenshot(SCR_WIDTH, SCR_HEIGHT, charpath);
            }
        }
    }
}

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

