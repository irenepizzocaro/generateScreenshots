cmake_minimum_required(VERSION 3.10)

project(GenerateScreenshotsLib)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

add_subdirectory(include/glfw)
add_subdirectory(include/glm)

add_library(glad include/glad.c)
include_directories(include/)

include_directories(include/glm include/glad)

set(SOURCES
        generateSceenshots.cpp
        generateScreenshots.h
)

find_package(OpenGL REQUIRED)

add_executable(GenerateScreenshotsLib main.cpp ${SOURCES})
target_link_libraries(GenerateScreenshotsLib glfw OpenGL::GL)

if(CMAKE_BUILD_TYPE MATCHES Debug)
    message("Configuring for Debug build with quick builds and fast debugging")
    target_compile_options(GenerateScreenshotsLib PRIVATE
            -O0        # No optimization
            -g         # Debug symbols
            -Wall      # All warnings
    )
    target_link_libraries(GenerateScreenshotsLib glad glfw OpenGL::GL)
elseif(CMAKE_BUILD_TYPE MATCHES Release)
    message("Configuring for Release build with extreme optimizations")
    target_compile_options(GenerateScreenshotsLib PRIVATE
            -O3        # Maximum optimization
            -march=native # Optimize for the host machine
            -flto      # Link time optimization
            -ffast-math # Aggressive math optimizations
            -funroll-loops # Unroll loops for performance
            -DNDEBUG   # Disable asserts
    )
    target_link_libraries(GenerateScreenshotsLib glad glfw OpenGL::GL)
endif()