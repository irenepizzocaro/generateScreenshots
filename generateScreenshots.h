void generate(void (*render()), float (*projection)[16], int stepMultiRis, std::string screenshotsPath);
void saveScreenshot(int width, int height, const char* filepath);
glm::mat4 getProjectionModifier(int i, int j, int n);