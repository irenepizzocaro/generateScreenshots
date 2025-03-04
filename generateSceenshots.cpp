/*  Funzioni necessarie a generare e salvare
    screenshots di un render in ambiente OpenGL 
*/

#include "generateScreenshots.h"

#ifndef _MSC_VER
#define sprintf_s(buffer, fmt, ...) snprintf(buffer, sizeof(buffer), fmt, __VA_ARGS__)
#endif

#define GLM_ENABLE_EXPERIMENTAL

#ifdef __APPLE__
  #define GL_SILENCE_DEPRECATION
  #include <OpenGL/gl3.h>
#else
  #include <GL/gl.h>
#endif

#define STB_IMAGE_IMPLEMENTATION
#define STB_IMAGE_WRITE_IMPLEMENTATION

#include <stb_image.h>
#include <stb_image_write.h>
#include <glm/gtx/transform.hpp>
#include <glm/gtc/type_ptr.hpp>

#include <string>
#include <functional>

/*
* @param render - funzione per il render
* @param projection - matrice di proiezione
* @param stepMultirisoluzione - numero di livelli di risoluzione che si intende generare
* @param screenshotsPath - percorso dove si intendono salvare gli screenshots
* @param SCR_WIDTH - larghezza in px per ogni screenshot
* @param SCR_HEIGHT - altezza in px per ogni screenshot
*/
void generate(const std::function<void()> &render, glm::mat4& projection, const int stepMultiRis,
    const std::string &screenshotsPath, const unsigned int SCR_WIDTH, const unsigned int SCR_HEIGHT) {
    const glm::mat4 baseProjection = projection;

    for (int scl = 0; scl < stepMultiRis; scl++) {
        int gridDim = static_cast<int>(pow(2, scl));

        for (int i = 0; i < gridDim; i++) {
            for (int j = 0; j < gridDim; j++) {

                projection = baseProjection;
                projection = getProjectionModifier(i, j, gridDim) * projection;

                glViewport(0, 0, SCR_WIDTH, SCR_HEIGHT);
                glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
                glFinish();

                render();

                std::string path = screenshotsPath + std::to_string(gridDim) + "-" + std::to_string(i) + "-" + std::to_string(j) + ".png";

                const char* charpath = path.c_str();

                saveScreenshot(SCR_WIDTH, SCR_HEIGHT, charpath);
            }
        }
    }

    projection = baseProjection;
}

void saveScreenshot(const int width, const int height, const char* filepath) {
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

glm::mat4 getProjectionModifier(const int i, const int j, const int n) {

    const float xOffSet = n - (2 * i) - 1;
    const float yOffSet = n - (2 * j) - 1;

    const glm::mat4 scalingFactor = glm::scale(glm::mat4(1.0f), glm::vec3(n, n, 1.0f));
    const glm::mat4 translateFactor = glm::translate(glm::mat4(1.0f), glm::vec3(xOffSet, yOffSet, 0.0f));

    return translateFactor * scalingFactor;
}

