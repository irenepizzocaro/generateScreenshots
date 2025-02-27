#include <iostream> 
#include <glm/glm.hpp>

void generate(std::function<void()> render, float* projection, int stepMultiRis, std::string screenshotsPath, const unsigned int SCR_WIDTH, const unsigned int SCR_HEIGHT);
void saveScreenshot(int width, int height, const char* filepath);
glm::mat4 getProjectionModifier(int i, int j, int n);